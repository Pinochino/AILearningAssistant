import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import path from 'path'
import fs from 'fs'
import { Material } from '../models/Material'
import { Flashcard } from '../models/Flashcard'
import { responseUtils } from '../utils/ResponseUtils'

// 🔐 Đọc API Key từ .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️ Missing GEMINI_API_KEY in .env')
  process.exit(1)
}

// 🚀 Khởi tạo Gemini SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// Helper functions
const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)

const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

const detectMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.pdf':
      return 'application/pdf'
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case '.xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case '.txt':
      return 'text/plain'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    default:
      return 'application/octet-stream'
  }
}

// 🧠 API: Tạo Flashcards bằng Gemini AI
export const generateFlashcards: RequestHandler = async (req, res) => {
  try {
    const { materialIds, classId, chapterIds, count = 10, difficulty = 'medium', prompt } = req.body

    // Validate input
    if (!Array.isArray(materialIds) || materialIds.length === 0) {
      return responseUtils({ req, res, code: 400, message: 'materialIds[] is required and must be non-empty' })
    }

    if (!isId(classId)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    }

    if (!Array.isArray(chapterIds) || chapterIds.length === 0 || !chapterIds.every(isId)) {
      return responseUtils({ req, res, code: 400, message: 'chapterIds[] is required and must contain valid IDs' })
    }

    const userId = getUserId(req)
    if (!userId) {
      return responseUtils({ req, res, code: 401, message: 'Unauthorized' })
    }

    // 🔍 Query materials from database
    const materials = await Material.find({
      _id: { $in: materialIds.map((id: string) => new Types.ObjectId(id)) },
      classId: new Types.ObjectId(classId)
    }).lean()

    if (!materials.length) {
      return responseUtils({ req, res, code: 404, message: 'No materials found for the given IDs and classId' })
    }

    console.log(`📚 Found ${materials.length} materials to process`)

    // 🗂 Upload files to Gemini
    const uploadedParts = []
    for (const material of materials) {
      try {
        let absolutePath: string

        // ✅ Check if fileUrl is already absolute path (old data)
        if (path.isAbsolute(material.fileUrl)) {
          // Old format: "D:\...\server\public\uploads\materials\file.docx"
          absolutePath = material.fileUrl
        } else {
          // New format: "/uploads/materials/file.docx"
          absolutePath = path.join(process.cwd(), 'public', material.fileUrl)
        }

        console.log(`🔍 Checking file: ${absolutePath}`)

        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️ File not found: ${absolutePath}`)
          continue
        }

        const mimeType = detectMimeType(material.fileName)

        console.log(`📤 Uploading: ${material.fileName}`)
        const uploadResult = await fileManager.uploadFile(absolutePath, {
          mimeType,
          displayName: material.fileName
        })

        uploadedParts.push({
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri
          }
        })

        console.log(`✅ Uploaded: ${material.fileName}`)
      } catch (uploadError: any) {
        console.error(`❌ Failed to upload ${material.fileName}:`, uploadError.message)
      }
    }

    if (uploadedParts.length === 0) {
      return responseUtils({
        req,
        res,
        code: 400,
        message: 'No valid files could be uploaded to Gemini'
      })
    }

    console.log(`✅ Successfully uploaded ${uploadedParts.length} files to Gemini`)

    // 🧾 Prompt cho Gemini
    const systemPrompt = `
Bạn là AI giáo dục chuyên nghiệp. Nhiệm vụ của bạn là tạo flashcards từ tài liệu học tập.

QUAN TRỌNG: Chỉ trả về JSON array thuần túy, KHÔNG thêm bất kỳ văn bản nào khác.

Hãy phân tích kỹ các tài liệu đã upload và tạo ${count} flashcards với cấu trúc sau:

[
  {
    "front": "Câu hỏi hoặc khái niệm cần học",
    "back": "Câu trả lời hoặc giải thích chi tiết",
    "difficulty": "easy|medium|hard"
  }
]

Yêu cầu:
- Flashcard phải chính xác, ngắn gọn, dễ nhớ
- "front" nên là câu hỏi hoặc thuật ngữ cần nhớ
- "back" nên là định nghĩa, giải thích hoặc câu trả lời đầy đủ
- Phân loại độ khó hợp lý: easy (khái niệm cơ bản), medium (cần hiểu), hard (cần phân tích)
- Ưu tiên các kiến thức quan trọng, công thức, định nghĩa chính

${prompt ? `\nYêu cầu bổ sung từ người dùng: ${prompt}` : ''}
`.trim()

    // 🤖 Gọi Gemini API
    console.log('🤖 Calling Gemini API...')
    const result = await model.generateContent([{ text: systemPrompt }, ...uploadedParts])

    const text = result.response.text().trim()
    console.log('📥 Gemini response received')

    // 🧩 Parse JSON từ output của Gemini
    let flashcardsData: Array<{ front: string; back: string; difficulty?: string }> = []

    try {
      // Remove markdown code blocks if present
      let cleanText = text
      if (text.includes('```json')) {
        cleanText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
      } else if (text.includes('```')) {
        cleanText = text.replace(/```\n?/g, '').trim()
      }

      flashcardsData = JSON.parse(cleanText)

      if (!Array.isArray(flashcardsData)) {
        throw new Error('Response is not an array')
      }
    } catch (parseError: any) {
      console.error('❌ Failed to parse JSON from Gemini:', parseError.message)
      console.log('Raw response:', text.substring(0, 500))

      return responseUtils({
        req,
        res,
        code: 500,
        message: 'AI returned invalid format. Please try again.',
        data: { rawResponse: text.substring(0, 200) }
      })
    }

    // Validate và filter flashcards
    const validFlashcards = flashcardsData.filter((card) => card.front && card.back).slice(0, count)

    if (validFlashcards.length === 0) {
      return responseUtils({
        req,
        res,
        code: 500,
        message: 'AI generated no valid flashcards'
      })
    }

    console.log(`✅ Parsed ${validFlashcards.length} valid flashcards`)

    // 🗃️ Lưu flashcards vào MongoDB
    const flashcards = await Flashcard.insertMany(
      validFlashcards.map((card) => ({
        front: card.front.trim(),
        back: card.back.trim(),
        chapters: chapterIds.map((id: string) => new Types.ObjectId(id)),
        classId: new Types.ObjectId(classId),
        createdBy: new Types.ObjectId(userId),
        isAIGenerated: true,
        difficulty: (card.difficulty || difficulty) as 'easy' | 'medium' | 'hard'
      }))
    )

    console.log(`💾 Saved ${flashcards.length} flashcards to database`)

    return responseUtils({
      req,
      res,
      code: 201,
      message: `Successfully created ${flashcards.length} AI-generated flashcards`,
      data: {
        flashcards,
        metadata: {
          materialsProcessed: uploadedParts.length,
          totalMaterials: materials.length,
          generatedCount: flashcards.length,
          requestedCount: count
        }
      }
    })
  } catch (error: any) {
    console.error('❌ Gemini Flashcard Generation Error:', error)
    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error while generating flashcards'
    })
  }
}

// 🎯 API: Tạo Quiz bằng AI (stub cho sau này)
export const generateQuiz: RequestHandler = async (req, res) => {
  return responseUtils({
    req,
    res,
    code: 501,
    message: 'Quiz generation not implemented yet'
  })
}
