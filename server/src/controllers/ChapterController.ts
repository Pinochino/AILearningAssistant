// src/controllers/ChapterController.ts
import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { responseUtils } from '../utils/ResponseUtils.js'
import { Chapter } from '../models/Chapter.js'

// Helper an toàn: lấy userId nếu middleware JWT có gắn req.user
function getUserIdFromReq(req: any): string | undefined {
  const user = (req?.user ?? {}) as {
    userId?: string
    id?: string
    _id?: string
    sub?: string
  }
  return user.userId ?? user.id ?? user._id ?? user.sub ?? undefined
}

/**
 * POST /chapters
 * body: { title: string; classId: string; order?: number }
 */
export const create: RequestHandler = async (req, res) => {
  try {
    const { title, classId, order } = (req.body || {}) as {
      title?: string
      classId?: string
      order?: number
    }

    if (!title || !classId) {
      return responseUtils({ req, res, code: 400, message: 'Missing required fields: title, classId' })
    }
    if (!Types.ObjectId.isValid(classId)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    }

    const chapter = await Chapter.create({
      title: String(title).trim(),
      classId: new Types.ObjectId(classId),
      order: typeof order === 'number' ? order : 0,
      documents: [],
      quizzes: [],
      flashcards: []
    })

    return responseUtils({
      req,
      res,
      code: 201,
      message: 'Chapter created successfully',
      data: chapter
    })
  } catch (error: any) {
    return responseUtils({
      req,
      res,
      code: 500,
      message: error?.message || 'Internal server error'
    })
  }
}

/**
 * GET /chapters/class/:classId
 */
export const listByClassId: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params
    if (!classId) {
      return responseUtils({ req, res, code: 400, message: 'Class ID is required' })
    }
    if (!Types.ObjectId.isValid(classId)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    }

    const chapters = await Chapter.find({ classId: new Types.ObjectId(classId) })
      .sort({ order: 1, createdAt: 1 })
      .lean()

    return responseUtils({ req, res, code: 200, message: 'OK', data: chapters })
  } catch (error: any) {
    return responseUtils({ req, res, code: 500, message: error?.message || 'Internal server error' })
  }
}

/**
 * GET /chapters/:id
 */
export const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!Types.ObjectId.isValid(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const chapter = await Chapter.findById(id)
    if (!chapter) {
      return responseUtils({ req, res, code: 404, message: 'Chapter not found' })
    }

    return responseUtils({ req, res, code: 200, message: 'OK', data: chapter })
  } catch (error: any) {
    return responseUtils({ req, res, code: 500, message: error?.message || 'Internal server error' })
  }
}

/**
 * PATCH /chapters/:id
 * body: { title?: string; order?: number }
 */
export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { title, order } = (req.body || {}) as { title?: string; order?: number }

    if (!Types.ObjectId.isValid(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const payload: Record<string, any> = {}
    if (typeof title === 'string') payload.title = title.trim()
    if (typeof order === 'number') payload.order = order

    if (Object.keys(payload).length === 0) {
      return responseUtils({ req, res, code: 400, message: 'No fields to update' })
    }

    const chapter = await Chapter.findByIdAndUpdate(id, payload, { new: true })
    if (!chapter) {
      return responseUtils({ req, res, code: 404, message: 'Chapter not found' })
    }

    return responseUtils({ req, res, code: 200, message: 'Chapter updated successfully', data: chapter })
  } catch (error: any) {
    return responseUtils({ req, res, code: 500, message: error?.message || 'Internal server error' })
  }
}

/**
 * DELETE /chapters/:id  (soft delete via mongoose-delete)
 */
export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!Types.ObjectId.isValid(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const userId = getUserIdFromReq(req)

    // Soft delete (mongoose-delete). Ghi deletedBy nếu có userId
    // Kiểu TS của plugin có thể không expose đầy đủ => ép any cho chắc.
    const deleted = await (Chapter as any).deleteById(id, userId)
    if (!deleted) {
      return responseUtils({ req, res, code: 404, message: 'Chapter not found' })
    }

    return responseUtils({ req, res, code: 200, message: 'Chapter deleted successfully' })
  } catch (error: any) {
    return responseUtils({ req, res, code: 500, message: error?.message || 'Internal server error' })
  }
}

/**
 * PATCH /chapters/:id/restore  (khôi phục soft delete)
 */
export const restore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!Types.ObjectId.isValid(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const restored = await (Chapter as any).restore({ _id: id })
    // restore() trả về WriteOpResult; kiểm tra tiếp có cần fetch lại không:
    const chapter = await Chapter.findById(id)
    if (!chapter) {
      return responseUtils({ req, res, code: 404, message: 'Chapter not found' })
    }

    return responseUtils({ req, res, code: 200, message: 'Chapter restored successfully', data: chapter })
  } catch (error: any) {
    return responseUtils({ req, res, code: 500, message: error?.message || 'Internal server error' })
  }
}
