import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { Material } from '../models/Material'
import { Flashcard } from '../models/Flashcard'
import { FlashcardSet } from '../models/FlashcardSet'
import { responseUtils } from '../utils/ResponseUtils'
import { Quiz } from '~/models/Quiz'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = process.env.PUBLIC_DIR ? path.resolve(process.env.PUBLIC_DIR) : path.resolve(process.cwd(), 'public')

function resolveMaterialAbsolutePath(fileUrlOrPath: string) {
  if (!fileUrlOrPath) return ''

  // Nếu đã là absolute path
  if (path.isAbsolute(fileUrlOrPath)) {
    if (fs.existsSync(fileUrlOrPath)) return fileUrlOrPath
  }

  // Chuẩn hóa: loại bỏ các ký tự đầu không cần thiết
  const cleanPath = fileUrlOrPath
    .replace(/^\.?\//, '') // Bỏ ./ hoặc /
    .replace(/^public\//, '') // Bỏ public/ nếu có
    .replace(/\\/g, '/') // Chuyển \ thành /

  // Thử các cách ghép path khác nhau
  const candidates = [
    path.join(process.cwd(), 'public', cleanPath),
    path.join(process.cwd(), cleanPath),
    path.join(PUBLIC_DIR, cleanPath)
  ]

  for (const candidate of candidates) {
    console.log(`🔍 Trying: ${candidate}`)
    if (fs.existsSync(candidate)) {
      console.log(`✅ Found: ${candidate}`)
      return candidate
    }
  }

  console.error(`❌ File not found after checking all candidates`)
  console.error(`Original path: ${fileUrlOrPath}`)
  return candidates[0] // Fallback
}

// 📝 Đọc API Key từ .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('⚠️ Missing GEMINI_API_KEY in .env')
  process.exit(1)
}

// 🚀 Khởi tạo Gemini SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// Helper functions
const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)

const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

// ✅ FIXED: Danh sách MIME types được Gemini hỗ trợ
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/x-javascript',
  'text/x-typescript',
  'application/x-typescript',
  'text/csv',
  'text/markdown',
  'text/x-python',
  'application/x-python-code',
  'application/json',
  'text/xml',
  'application/rtf',
  'text/rtf'
]

const detectMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.pdf':
      return 'application/pdf'
    case '.txt':
      return 'text/plain'
    case '.html':
      return 'text/html'
    case '.css':
      return 'text/css'
    case '.js':
      return 'text/javascript'
    case '.ts':
      return 'text/x-typescript'
    case '.py':
      return 'text/x-python'
    case '.json':
      return 'application/json'
    case '.csv':
      return 'text/csv'
    case '.md':
      return 'text/markdown'
    case '.xml':
      return 'text/xml'
    case '.rtf':
      return 'text/rtf'
    // ❌ Không hỗ trợ
    case '.docx':
    case '.pptx':
    case '.xlsx':
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'unsupported'
    default:
      return 'unsupported'
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

    // 📁 Query materials from database
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
    const skippedFiles: string[] = []

    console.log('CWD =', process.cwd())
    console.log('__dirname =', __dirname)
    console.log('PUBLIC_DIR =', PUBLIC_DIR)

    for (const material of materials) {
      try {
        console.log('🔍 fileUrl:', material.fileUrl)

        const absolutePath = resolveMaterialAbsolutePath(material.fileUrl)
        console.log('🔍 absolutePath:', absolutePath)

        // 2) Check tồn tại
        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️ File not found: ${absolutePath}`)
          skippedFiles.push(`${material.fileName} (not found)`)
          continue
        }

        const mimeType = detectMimeType(material.fileName)

        // ✅ FIXED: Kiểm tra MIME type có được hỗ trợ không
        if (mimeType === 'unsupported' || !SUPPORTED_MIME_TYPES.includes(mimeType)) {
          console.warn(`⚠️ Unsupported file type: ${material.fileName} (${mimeType})`)
          skippedFiles.push(`${material.fileName} (unsupported format)`)
          continue
        }

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
        skippedFiles.push(`${material.fileName} (${uploadError.message})`)
      }
    }

    if (uploadedParts.length === 0) {
      return responseUtils({
        req,
        res,
        code: 400,
        message: 'No valid files could be uploaded to Gemini. Only PDF and text files are supported.',
        data: {
          skippedFiles,
          supportedFormats: 'PDF, TXT, HTML, CSS, JS, TS, PY, JSON, CSV, MD, XML, RTF'
        }
      })
    }

    console.log(`✅ Successfully uploaded ${uploadedParts.length} files to Gemini`)
    if (skippedFiles.length > 0) {
      console.log(`⚠️ Skipped ${skippedFiles.length} files:`, skippedFiles)
    }

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

    // 🗃️ Lưu flashcards vào MongoDB as FlashcardSet
    const flashcardSet = await FlashcardSet.create({
      title: req.body.title || `Flashcard Set ${new Date().toLocaleDateString('vi-VN')}`,
      description: req.body.description || `Tự động tạo bởi AI từ ${materials.length} tài liệu`,
      classId: new Types.ObjectId(classId),
      chapters: chapterIds.map((id: string) => new Types.ObjectId(id)),
      createdBy: new Types.ObjectId(userId),
      isAIGenerated: true,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      flashcards: validFlashcards.map((card) => ({
        front: card.front.trim(),
        back: card.back.trim(),
        difficulty: (card.difficulty || difficulty) as 'easy' | 'medium' | 'hard'
      })),
      totalCards: validFlashcards.length
    })

    console.log(`💾 Saved flashcard set with ${flashcardSet.flashcards.length} cards to database`)

    return responseUtils({
      req,
      res,
      code: 201,
      message: `Successfully created flashcard set with ${flashcardSet.flashcards.length} AI-generated flashcards`,
      data: {
        flashcardSet,
        metadata: {
          materialsProcessed: uploadedParts.length,
          totalMaterials: materials.length,
          generatedCount: flashcardSet.flashcards.length,
          requestedCount: count,
          skippedFiles: skippedFiles.length > 0 ? skippedFiles : undefined
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

// 🎯 API: Tạo Quiz bằng AI
export const generateQuiz: RequestHandler = async (req, res) => {
  try {
    const {
      title,
      materialIds,
      classId,
      chapterIds,
      count = 10,
      difficulty = 'medium',
      prompt,
      durationMinutes,
      description
    } = req.body

    // Validate input
    if (!title || typeof title !== 'string') {
      return responseUtils({ req, res, code: 400, message: 'title is required' })
    }

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

    // 📚 Query materials from database
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
    const skippedFiles: string[] = []

    for (const material of materials) {
      try {
        console.log('📁 fileUrl:', material.fileUrl)

        const absolutePath = resolveMaterialAbsolutePath(material.fileUrl)
        console.log('📁 absolutePath:', absolutePath)

        // Check existence
        if (!fs.existsSync(absolutePath)) {
          console.warn(`⚠️ File not found: ${absolutePath}`)
          skippedFiles.push(`${material.fileName} (not found)`)
          continue
        }

        const mimeType = detectMimeType(material.fileName)

        // Check MIME type support
        if (mimeType === 'unsupported' || !SUPPORTED_MIME_TYPES.includes(mimeType)) {
          console.warn(`⚠️ Unsupported file type: ${material.fileName} (${mimeType})`)
          skippedFiles.push(`${material.fileName} (unsupported format)`)
          continue
        }

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
        skippedFiles.push(`${material.fileName} (${uploadError.message})`)
      }
    }

    if (uploadedParts.length === 0) {
      return responseUtils({
        req,
        res,
        code: 400,
        message: 'No valid files could be uploaded to Gemini. Only PDF and text files are supported.',
        data: {
          skippedFiles,
          supportedFormats: 'PDF, TXT, HTML, CSS, JS, TS, PY, JSON, CSV, MD, XML, RTF'
        }
      })
    }

    console.log(`✅ Successfully uploaded ${uploadedParts.length} files to Gemini`)
    if (skippedFiles.length > 0) {
      console.log(`⚠️ Skipped ${skippedFiles.length} files:`, skippedFiles)
    }

    // 🧾 Prompt cho Gemini
    const systemPrompt = `
Bạn là AI giáo dục chuyên nghiệp. Nhiệm vụ của bạn là tạo quiz trắc nghiệm từ tài liệu học tập.

QUAN TRỌNG: Chỉ trả về JSON array thuần túy, KHÔNG thêm bất kỳ văn bản nào khác.

Hãy phân tích kỹ các tài liệu đã upload và tạo ${count} câu hỏi trắc nghiệm với cấu trúc sau:

[
  {
    "question": "Câu hỏi rõ ràng và cụ thể",
    "answers": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": 0,
    "explanation": "Giải thích ngắn gọn tại sao đáp án này đúng",
    "difficulty": "easy|medium|hard"
  }
]

Yêu cầu:
- Mỗi câu hỏi phải có đúng 4 đáp án
- correctAnswer là chỉ số (0-3) của đáp án đúng
- Câu hỏi phải rõ ràng, không mơ hồ
- Đáp án sai phải hợp lý, không quá dễ loại trừ
- Phân loại độ khó: easy (khái niệm cơ bản), medium (cần hiểu), hard (cần phân tích/áp dụng)
- Đa dạng dạng câu hỏi: định nghĩa, ứng dụng, so sánh, lý giải
- Ưu tiên kiến thức quan trọng, công thức, định lý chính

${prompt ? `\nYêu cầu bổ sung từ người dùng: ${prompt}` : ''}
${difficulty ? `\nĐộ khó ưu tiên: ${difficulty}` : ''}
`.trim()

    // 🤖 Gọi Gemini API
    console.log('🤖 Calling Gemini API for quiz generation...')
    const result = await model.generateContent([{ text: systemPrompt }, ...uploadedParts])

    const text = result.response.text().trim()
    console.log('📥 Gemini response received')

    // 🧩 Parse JSON từ output của Gemini
    let questionsData: Array<{
      question: string
      answers: string[]
      correctAnswer: number
      explanation?: string
      difficulty?: string
    }> = []

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

      questionsData = JSON.parse(cleanText)

      if (!Array.isArray(questionsData)) {
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

    // Validate and filter questions
    const validQuestions = questionsData
      .filter((q) => {
        return (
          q.question &&
          Array.isArray(q.answers) &&
          q.answers.length >= 2 &&
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.answers.length
        )
      })
      .slice(0, count)

    if (validQuestions.length === 0) {
      return responseUtils({
        req,
        res,
        code: 500,
        message: 'AI generated no valid questions'
      })
    }

    console.log(`✅ Parsed ${validQuestions.length} valid questions`)

    // 🗃️ Tạo Quiz trong MongoDB
    const quiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim(),
      classId: new Types.ObjectId(classId),
      chapters: chapterIds.map((id: string) => new Types.ObjectId(id)),
      createdBy: new Types.ObjectId(userId),
      durationMinutes,
      isAIGenerated: true,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      isPublic: false,
      questions: validQuestions.map((q) => ({
        question: q.question.trim(),
        answers: q.answers.map((a) => a.trim()),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation?.trim()
      }))
    })

    console.log(`💾 Created quiz: ${quiz._id}`)

    return responseUtils({
      req,
      res,
      code: 201,
      message: `Successfully created AI-generated quiz with ${validQuestions.length} questions`,
      data: {
        quiz,
        metadata: {
          materialsProcessed: uploadedParts.length,
          totalMaterials: materials.length,
          generatedQuestions: validQuestions.length,
          requestedQuestions: count,
          skippedFiles: skippedFiles.length > 0 ? skippedFiles : undefined
        }
      }
    })
  } catch (error: any) {
    console.error('❌ Gemini Quiz Generation Error:', error)
    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error while generating quiz'
    })
  }
}
