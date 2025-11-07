import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { responseUtils } from '../utils/ResponseUtils'
import { Quiz, IQuizQuestion } from '../models/Quiz'

const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)
const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

function validateQuestions(questions: IQuizQuestion[]): string | null {
  if (!Array.isArray(questions) || questions.length === 0) return 'questions[] is required'
  for (const q of questions) {
    if (!q?.question || !Array.isArray(q.answers) || q.answers.length < 2) {
      return 'Each question needs question text and at least 2 answers'
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.answers.length) {
      return 'correctAnswer index is out of range'
    }
  }
  return null
}

// POST /quizzes
export const create: RequestHandler = async (req, res) => {
  try {
    const { title, classId, chapters, questions, description, durationMinutes, isPublic, isAIGenerated, difficulty } = req.body || {}
    if (!title || !classId || !Array.isArray(chapters) || chapters.length === 0) {
      return responseUtils({ req, res, code: 400, message: 'Missing required fields: title, classId, chapters[]' })
    }
    if (!isId(classId) || !chapters.every((c: string) => isId(c))) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId or chapters' })
    }
    if (questions) {
      const err = validateQuestions(questions)
      if (err) return responseUtils({ req, res, code: 400, message: err })
    }
    const createdBy = getUserId(req)
    const quiz = await Quiz.create({
      title: String(title).trim(),
      description,
      classId: new Types.ObjectId(classId),
      chapters: chapters.map((c: string) => new Types.ObjectId(c)),
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      durationMinutes,
      isPublic: !!isPublic,
      isAIGenerated: !!isAIGenerated,
      difficulty,
      questions: questions || []
    })
    return responseUtils({ req, res, code: 201, message: 'Quiz created', data: quiz })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// POST /quizzes/:id/questions/bulk
export const addQuestionsBulk: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { questions } = req.body || {}
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const err = validateQuestions(questions || [])
    if (err) return responseUtils({ req, res, code: 400, message: err })
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $push: { questions: { $each: questions } } },
      { new: true }
    )
    if (!quiz) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'Questions added', data: quiz })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// GET /quizzes/class/:classId
// query: chapter?(single id), search?, isPublic?, page?, limit?, difficulty?
export const listByClass: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params
    if (!isId(classId)) return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    const { chapter, search, isPublic, page = '1', limit = '20', difficulty } = req.query as Record<string, string>
    const filter: any = { classId: new Types.ObjectId(classId) }
    if (chapter && isId(chapter)) filter.chapters = new Types.ObjectId(chapter)
    if (typeof isPublic !== 'undefined') filter.isPublic = isPublic === 'true'
    if (difficulty) filter.difficulty = difficulty
    if (search) filter.title = { $regex: search, $options: 'i' }

    const p = Math.max(1, parseInt(String(page)) || 1)
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))

    const [items, total] = await Promise.all([
      Quiz.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Quiz.countDocuments(filter)
    ])
    return responseUtils({
      req, res, code: 200, message: 'OK',
      data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
    })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// GET /quizzes/:id
export const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const quiz = await Quiz.findById(id)
    if (!quiz) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'OK', data: quiz })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// PATCH /quizzes/:id
export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const { title, description, durationMinutes, isPublic, difficulty } = req.body || {}
    const payload: any = {}
    if (typeof title === 'string') payload.title = title.trim()
    if (typeof description === 'string') payload.description = description.trim()
    if (typeof durationMinutes === 'number') payload.durationMinutes = durationMinutes
    if (typeof isPublic === 'boolean') payload.isPublic = isPublic
    if (difficulty) payload.difficulty = difficulty
    if (!Object.keys(payload).length) return responseUtils({ req, res, code: 400, message: 'No fields to update' })
    const updated = await Quiz.findByIdAndUpdate(id, payload, { new: true })
    if (!updated) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'Quiz updated', data: updated })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// PATCH /quizzes/:id/publish  (toggle or set)
export const publish: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { isPublic } = req.body || {}
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const updated = await Quiz.findByIdAndUpdate(id, { isPublic: !!isPublic }, { new: true })
    if (!updated) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'Publish status updated', data: updated })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// DELETE /quizzes/:id  (soft)
export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const userId = getUserId(req)
    const deleted = await (Quiz as any).deleteById(id, { deletedBy: userId })
    if (!deleted) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'Quiz deleted' })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// PATCH /quizzes/:id/restore
export const restore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    await (Quiz as any).restore({ _id: id })
    const quiz = await Quiz.findById(id)
    if (!quiz) return responseUtils({ req, res, code: 404, message: 'Quiz not found' })
    return responseUtils({ req, res, code: 200, message: 'Quiz restored', data: quiz })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}
