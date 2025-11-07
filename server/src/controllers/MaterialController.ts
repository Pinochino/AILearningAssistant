import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import { responseUtils } from '../utils/ResponseUtils'
import { Material, MaterialType } from '../models/Material'

const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)
const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

function detectMaterialType(mime: string, fileName: string): MaterialType {
  const m = (mime || '').toLowerCase()
  const f = (fileName || '').toLowerCase()
  if (m.includes('pdf') || f.endsWith('.pdf')) return 'pdf'
  if (m.includes('msword') || m.includes('officedocument.wordprocessingml') || f.endsWith('.docx') || f.endsWith('.doc')) return 'docx'
  if (m.includes('powerpoint') || m.includes('officedocument.presentationml') || f.endsWith('.ppt') || f.endsWith('.pptx')) return 'pptx'
  if (m.includes('spreadsheet') || f.endsWith('.xls') || f.endsWith('.xlsx')) return 'xlsx'
  if (m.startsWith('image/')) return 'image'
  if (m.startsWith('video/')) return 'video'
  if (m.startsWith('audio/')) return 'audio'
  if (m.includes('text/') || f.endsWith('.txt')) return 'txt'
  return 'other'
}

/**
 * POST /materials
 * multipart/form-data:
 *  - file: File (multer gắn vào req.file)
 *  - body: { title?: string; description?: string; classId: string; chapter: string; isAIGenerated?: boolean }
 * YÊU CẦU middleware upload: upload.single('file')
 */
export const upload: RequestHandler = async (req, res) => {
  try {
    const { classId, chapter, title, description, isAIGenerated } = req.body
    const file = req.file

    if (!file) {
      return responseUtils({ req, res, code: 400, message: 'File is required' })
    }

    if (!isId(classId) || !isId(chapter)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId or chapter' })
    }

    const userId = getUserId(req)
    if (!userId) {
      return responseUtils({ req, res, code: 401, message: 'Unauthorized' })
    }

    console.log('File uploaded:', file)

    // ✅ Lưu đường dẫn tương đối thay vì tuyệt đối
    const fileUrl = `/uploads/materials/${file.filename}` // Thay vì file.path
    const fileName = file.originalname
    const mimeType = file.mimetype
    const size = file.size || 0
    const type = detectMaterialType(mimeType, fileName)

    const doc = await Material.create({
      title: (title || fileName).toString().trim(),
      description,
      classId: new Types.ObjectId(classId),
      chapter: new Types.ObjectId(chapter),
      uploadedBy: new Types.ObjectId(userId),

      fileName,
      fileUrl, // ✅ Đã sửa
      mimeType,
      size,
      type,
      isAIGenerated: !!isAIGenerated
    })

    return responseUtils({ req, res, code: 201, message: 'Material uploaded', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}


/**
 * POST /materials/link
 * Tạo material từ 1 URL có sẵn (không upload file). Optional, dùng khi tài liệu host ngoài.
 * body: { classId, chapter, fileUrl, fileName, mimeType?, title?, description? }
 */
export const createFromLink: RequestHandler = async (req, res) => {
  try {
    const { classId, chapter, fileUrl, fileName, mimeType, title, description, isAIGenerated } = (req.body || {}) as Record<string, any>
    if (!isId(classId) || !isId(chapter) || !fileUrl || !fileName) {
      return responseUtils({ req, res, code: 400, message: 'classId, chapter, fileUrl, fileName are required' })
    }
    const userId = getUserId(req)
    if (!userId) return responseUtils({ req, res, code: 401, message: 'Unauthorized' })

    const type = detectMaterialType(mimeType || '', fileName)
    const doc = await Material.create({
      title: (title || fileName).toString().trim(),
      description,
      classId: new Types.ObjectId(classId),
      chapter: new Types.ObjectId(chapter),
      uploadedBy: new Types.ObjectId(userId),

      fileName,
      fileUrl,
      mimeType: mimeType || 'application/octet-stream',
      size: 0,
      type,
      isAIGenerated: !!isAIGenerated
    })

    return responseUtils({ req, res, code: 201, message: 'Material created from link', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * GET /materials/class/:classId
 * query: { chapter?: string; search?: string; page?: number; limit?: number; type?: MaterialType }
 */
export const listByClass: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params
    if (!isId(classId)) return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    const { chapter, search, page = '1', limit = '20', type } = req.query as Record<string, string>
    const filter: any = { classId: new Types.ObjectId(classId) }
    if (chapter && isId(chapter)) filter.chapter = new Types.ObjectId(chapter)
    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ]
    }

    const p = Math.max(1, parseInt(String(page)) || 1)
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))
    const [items, total] = await Promise.all([
      Material.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Material.countDocuments(filter)
    ])
    return responseUtils({
      req, res, code: 200, message: 'OK',
      data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
    })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * GET /materials/chapter/:chapterId
 */
export const listByChapter: RequestHandler = async (req, res) => {
  try {
    const { chapterId } = req.params
    if (!isId(chapterId)) return responseUtils({ req, res, code: 400, message: 'Invalid chapterId' })
    const { search, page = '1', limit = '20', type } = req.query as Record<string, string>
    const filter: any = { chapter: new Types.ObjectId(chapterId) }
    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ]
    }
    const p = Math.max(1, parseInt(String(page)) || 1)
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 20))
    const [items, total] = await Promise.all([
      Material.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Material.countDocuments(filter)
    ])
    return responseUtils({
      req, res, code: 200, message: 'OK',
      data: { items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }
    })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * GET /materials/:id
 */
export const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const doc = await Material.findById(id)
    if (!doc) return responseUtils({ req, res, code: 404, message: 'Material not found' })
    return responseUtils({ req, res, code: 200, message: 'OK', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * PATCH /materials/:id
 * body: { title?, description?, pageCount?, durationSec? }
 */
export const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const { title, description, pageCount, durationSec } = (req.body || {}) as Record<string, any>
    const payload: any = {}
    if (typeof title === 'string') payload.title = title.trim()
    if (typeof description === 'string') payload.description = description.trim()
    if (typeof pageCount === 'number') payload.pageCount = Math.max(0, pageCount)
    if (typeof durationSec === 'number') payload.durationSec = Math.max(0, durationSec)

    if (!Object.keys(payload).length) {
      return responseUtils({ req, res, code: 400, message: 'No fields to update' })
    }

    const updated = await Material.findByIdAndUpdate(id, payload, { new: true })
    if (!updated) return responseUtils({ req, res, code: 404, message: 'Material not found' })
    return responseUtils({ req, res, code: 200, message: 'Material updated', data: updated })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * DELETE /materials/:id  (soft delete)
 */
export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    const userId = getUserId(req)
    const deleted = await (Material as any).deleteById(id, { deletedBy: userId })
    if (!deleted) return responseUtils({ req, res, code: 404, message: 'Material not found' })
    return responseUtils({ req, res, code: 200, message: 'Material deleted' })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}

/**
 * PATCH /materials/:id/restore
 */
export const restore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    await (Material as any).restore({ _id: id })
    const doc = await Material.findById(id)
    if (!doc) return responseUtils({ req, res, code: 404, message: 'Material not found' })
    return responseUtils({ req, res, code: 200, message: 'Material restored', data: doc })
  } catch (err: any) {
    return responseUtils({ req, res, code: 500, message: err?.message || 'Internal server error' })
  }
}
