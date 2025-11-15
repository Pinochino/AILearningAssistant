import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { responseUtils } from '../utils/ResponseUtils'
import { Flashcard } from '../models/Flashcard'

const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)
const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

// POST /flashcards
export const create: RequestHandler = async (req, res) => {
  try {
    const { front, back, chapters, classId, isAIGenerated, difficulty } = req.body || {}

    if (!front || !back || !Array.isArray(chapters) || !chapters.length || !classId) {
      return responseUtils({
        req,
        res,
        code: 400,
        message: 'Missing required fields: front, back, chapters[], classId'
      })
    }
    if (!Array.isArray(chapters) || chapters.some((c: string) => !isId(c)) || !isId(classId)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid chapters[] or classId' })
    }

    const createdBy = getUserId(req)
    const doc = await Flashcard.create({
      front: String(front).trim(),
      back: String(back).trim(),
      chapters: chapters.map((c: string) => new Types.ObjectId(c)),
      classId: new Types.ObjectId(classId),
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      isAIGenerated: !!isAIGenerated,
      difficulty
    })
    return responseUtils({ req, res, code: 201, message: 'Flashcard created', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// POST /flashcards/bulk
export const bulkCreate: RequestHandler = async (req, res) => {
  try {
    const { classId, chapters, items } = req.body || {}
    if (
      !isId(classId) ||
      !Array.isArray(chapters) ||
      chapters.length === 0 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return responseUtils({ req, res, code: 400, message: 'classId, chapters[], and items[] are required' })
    }
    const createdBy = getUserId(req)
    const docs = items
      .filter((i: any) => i?.front && i?.back)
      .map((i: any) => ({
        front: String(i.front).trim(),
        back: String(i.back).trim(),
        chapters: chapters.map((c: string) => new Types.ObjectId(c)),
        classId: new Types.ObjectId(classId),
        createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        isAIGenerated: !!i.isAIGenerated,
        difficulty: i.difficulty
      }))
    if (!docs.length) return responseUtils({ req, res, code: 400, message: 'No valid items' })
    const inserted = await Flashcard.insertMany(docs)
    return responseUtils({ req, res, code: 201, message: 'Flashcards created', data: inserted })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// GET /flashcards/class/:classId
export const listByClass: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params
    if (!isId(classId)) return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    const { chapters, search, page = '1', limit = '20', difficulty } = req.query as Record<string, any>
    const filter: any = { classId: new Types.ObjectId(classId) }

    if (Array.isArray(chapters) && chapters.every((c) => isId(c))) {
      filter.chapters = { $in: chapters.map((c) => new Types.ObjectId(c)) }
    } else if (typeof chapters === 'string' && isId(chapters)) {
      // trường hợp chỉ truyền 1 id
      filter.chapters = { $in: [new Types.ObjectId(chapters)] }
    }
    if (difficulty) filter.difficulty = difficulty
    if (search) filter.$or = [{ front: { $regex: search, $options: 'i' } }, { back: { $regex: search, $options: 'i' } }]
    const p = Math.max(1, parseInt(String(page)) || 1)
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))
    const [items, total] = await Promise.all([
      Flashcard.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Flashcard.countDocuments(filter)
    ])
    return responseUtils({
      req,
      res,
      code: 200,
      message: 'OK',
      data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
    })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// GET /flashcards/chapter/:chapterId
export const listByChapter: RequestHandler = async (req, res) => {
  try {
    const { chapterId } = req.params
    if (!isId(chapterId)) return responseUtils({ req, res, code: 400, message: 'Invalid chapterId' })
    const { search, page = '1', limit = '20', difficulty } = req.query as Record<string, string>
    const filter: any = { chapters: { $in: [new Types.ObjectId(chapterId)] } }
    if (difficulty) filter.difficulty = difficulty
    if (search) filter.$or = [{ front: { $regex: search, $options: 'i' } }, { back: { $regex: search, $options: 'i' } }]
    const p = Math.max(1, parseInt(String(page)) || 1)
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))
    const [items, total] = await Promise.all([
      Flashcard.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      Flashcard.countDocuments(filter)
    ])
    return responseUtils({
      req,
      res,
      code: 200,
      message: 'OK',
      data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
    })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// GET /flashcards/:id
export const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const doc = await Flashcard.findById(id)
    if (!doc) return responseUtils({ req, res, code: 404, message: 'Flashcard not found' })
    return responseUtils({ req, res, code: 200, message: 'OK', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// PATCH /flashcards/:id
export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const { front, back, difficulty } = req.body || {}
    const payload: any = {}
    if (typeof front === 'string') payload.front = front.trim()
    if (typeof back === 'string') payload.back = back.trim()
    if (difficulty) payload.difficulty = difficulty
    if (!Object.keys(payload).length) return responseUtils({ req, res, code: 400, message: 'No fields to update' })
    const updated = await Flashcard.findByIdAndUpdate(id, payload, { new: true })
    if (!updated) return responseUtils({ req, res, code: 404, message: 'Flashcard not found' })
    return responseUtils({ req, res, code: 200, message: 'Flashcard updated', data: updated })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// DELETE /flashcards/:id (soft)
export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const userId = getUserId(req)
    const deleted = await (Flashcard as any).deleteById(id, { deletedBy: userId })
    if (!deleted) return responseUtils({ req, res, code: 404, message: 'Flashcard not found' })
    return responseUtils({ req, res, code: 200, message: 'Flashcard deleted' })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}

// PATCH /flashcards/:id/restore
export const restore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    await (Flashcard as any).restore({ _id: id })
    const doc = await Flashcard.findById(id)
    if (!doc) return responseUtils({ req, res, code: 404, message: 'Flashcard not found' })
    return responseUtils({ req, res, code: 200, message: 'Flashcard restored', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err.message || 'Internal server error' })
  }
}
