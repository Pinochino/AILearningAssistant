import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server' // ✅ đúng
import fs from 'fs'
import path from 'path'
import docxConverter from '../services/docxConverterService'

type MaterialLike = {
  _id?: any
  title?: string
  fileUrl: string // ✅ Đổi từ filePath sang fileUrl
}

export class AIService {
  private genAI: GoogleGenerativeAI
  private fileManager: GoogleAIFileManager

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY')
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.fileManager = new GoogleAIFileManager(apiKey)
  }

  // 🔹 Upload file lên Gemini qua File Manager
  private async uploadToGemini(filePath: string) {
    let pathToUpload = filePath
    let mimeType = this.detectMimeType(filePath)

    // Nếu vẫn là DOCX → convert sang PDF trước khi upload
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('🔄 Converting DOCX → PDF on-the-fly:', path.basename(filePath))
      try {
        const pdfPath = await docxConverter.convertToPdf(filePath, { deleteOriginal: false })
        pathToUpload = pdfPath
        mimeType = 'application/pdf'
        console.log('✅ On-the-fly conversion OK:', path.basename(pdfPath))
      } catch (e: any) {
        console.warn('⚠️ On-the-fly convert failed:', e?.message || e)
        // cho phép fallback khác nếu muốn: trích text ra .txt rồi upload
        // hoặc ném lỗi để skip file này
        throw new Error('DOCX not supported and conversion failed')
      }
    }

    const st = fs.statSync(pathToUpload)
    console.log('📤 Uploading to Gemini:', pathToUpload, 'size=', st.size)

    const result = await this.fileManager.uploadFile(pathToUpload, {
      mimeType,
      displayName: path.basename(pathToUpload)
    })

    // (tuỳ) đợi ACTIVE rồi mới dùng
    // await this.fileManager.waitForFilesActive([result.file.name])

    return result.file
  }

  // 🔹 Xác định MIME type
  private detectMimeType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase()
    switch (ext) {
      case '.pdf':
        return 'application/pdf'
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case '.txt':
        return 'text/plain'
      case '.pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      default:
        return 'application/octet-stream'
    }
  }

  // 🔹 Sinh flashcards từ file bằng Gemini
  async generateFlashcards(opts: { materials: MaterialLike[]; prompt?: string; count?: number }) {
    const { materials = [], prompt, count = 5 } = opts

    if (!materials.length) throw new Error('No materials provided')

    // 1️⃣ Upload tất cả các file
    const uploadedFiles = await Promise.all(
      materials.map(async (m): Promise<any> => {
        if (!m.fileUrl) {
          console.warn(`⚠️ Missing fileUrl for material: ${m.title}`)
          return null
        }

        // Convert relative URL to absolute path
        const absolutePath = path.join(process.cwd(), 'public', m.fileUrl)

        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️ File not found: ${absolutePath}`)
          return null
        }

        return this.uploadToGemini(absolutePath)
      })
    )

    const validFiles = uploadedFiles.filter(Boolean)
    if (!validFiles.length) throw new Error('No valid files uploaded')

    // 2️⃣ Gọi model Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // 3️⃣ Prompt hướng dẫn rõ ràng
    const basePrompt = `
You are an educational AI system.
Generate ${count} concise and factual flashcards based on the uploaded materials.
Return only a valid JSON array in this format:
[
  {"front": "Question", "back": "Answer", "difficulty": "easy|medium|hard"}
]
${prompt ? 'Additional context: ' + prompt : ''}
`

    // 4️⃣ Gửi request tới Gemini kèm file
    const result = await model.generateContent([
      { text: basePrompt },
      ...validFiles.map((f: any) => ({
        fileData: { fileUri: f.uri, mimeType: f.mimeType }
      }))
    ])

    const text = result.response.text()
    let flashcards: Array<{ front: string; back: string; difficulty?: string }> = []

    try {
      flashcards = JSON.parse(text)
    } catch {
      // fallback: parse từng JSON object nếu output không chuẩn
      const matches = [...text.matchAll(/\{[^}]+\}/g)]
        .map((m) => {
          try {
            return JSON.parse(m[0])
          } catch {
            return null
          }
        })
        .filter(Boolean) as any[]
      flashcards = matches.slice(0, count)
    }

    return flashcards.map((card) => ({
      front: card.front || 'No question',
      back: card.back || 'No answer',
      difficulty: card.difficulty || 'medium'
    }))
  }
}

export default new AIService()
