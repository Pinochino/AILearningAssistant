// src/controllers/MaterialController.ts
import { RequestHandler } from 'express'
import { Types } from 'mongoose'
import path from 'path'
import fs from 'fs'
import { Material } from '../models/Material'
import { Chapter } from '../models/Chapter'
import { responseUtils } from '../utils/ResponseUtils'
import docxConverter from '../services/docxConverterService'

const isId = (v?: string) => !!v && Types.ObjectId.isValid(v)

const getUserId = (req: any): string | undefined => {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

// POST /materials/upload
export const uploadMaterial: RequestHandler = async (req, res) => {
  try {
    const { title, description, classId, chapterId } = req.body
    const file = req.file

    // Validation
    if (!file) {
      return responseUtils({ req, res, code: 400, message: 'No file uploaded' })
    }

    if (!title || !isId(classId) || !isId(chapterId)) {
      // Cleanup uploaded file nếu validation fail
      fs.unlinkSync(file.path)
      return responseUtils({ 
        req, 
        res, 
        code: 400, 
        message: 'Missing required fields: title, classId, chapterId' 
      })
    }

    const userId = getUserId(req)
    if (!userId) {
      fs.unlinkSync(file.path)
      return responseUtils({ req, res, code: 401, message: 'Unauthorized' })
    }

    // Verify chapter exists and belongs to class
    const chapter = await Chapter.findById(chapterId).lean()
    if (!chapter) {
      fs.unlinkSync(file.path)
      return responseUtils({ req, res, code: 404, message: 'Chapter not found' })
    }

    if (String(chapter.classId) !== String(classId)) {
      fs.unlinkSync(file.path)
      return responseUtils({ 
        req, 
        res, 
        code: 400, 
        message: 'Chapter does not belong to specified class' 
      })
    }

    let finalFilePath = file.path
    let finalFileName = file.filename
    let finalMimeType = file.mimetype
    let fileType = detectFileType(file.mimetype)

    // 🔄 Convert .docx to .pdf automatically
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('🔄 Converting .docx to .pdf...')
      
      try {
        const pdfPath = await docxConverter.convertToPdf(file.path, {
          deleteOriginal: true  // Xóa .docx gốc sau khi convert
        })

        finalFilePath = pdfPath
        finalFileName = path.basename(pdfPath)
        finalMimeType = 'application/pdf'
        fileType = 'pdf'

        console.log('✅ Conversion successful')
      } catch (conversionError: any) {
        console.error('❌ Conversion failed:', conversionError.message)
        
        // Vẫn lưu file .docx gốc nếu conversion fail
        console.log('⚠️ Saving original .docx file')
      }
    }

    // Create relative URL for storage
    const relativePath = finalFilePath.replace(path.join(process.cwd(), 'public'), '')
      .replace(/\\/g, '/')  // Convert Windows backslashes to forward slashes

    // Create Material document
    const material = await Material.create({
      title: title.trim(),
      description: description?.trim(),
      classId: new Types.ObjectId(classId),
      chapter: new Types.ObjectId(chapterId),
      uploadedBy: new Types.ObjectId(userId),
      fileName: finalFileName,
      fileUrl: relativePath,
      mimeType: finalMimeType,
      size: fs.statSync(finalFilePath).size,
      type: fileType,
      isAIGenerated: false
    })

    // Add material to chapter's documents array
    await Chapter.findByIdAndUpdate(
      chapterId,
      { $addToSet: { documents: material._id } },
      { new: true }
    )

    console.log(`✅ Material uploaded: ${material.title}`)

    return responseUtils({
      req,
      res,
      code: 201,
      message: 'Material uploaded successfully',
      data: material
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    
    // Cleanup file if error occurs
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error'
    })
  }
}

// Helper function
function detectFileType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('wordprocessingml')) return 'docx'
  if (mimeType.includes('presentationml')) return 'pptx'
  if (mimeType.includes('spreadsheetml')) return 'xlsx'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('video')) return 'video'
  if (mimeType.includes('audio')) return 'audio'
  if (mimeType.includes('text/plain')) return 'txt'
  return 'other'
}

// GET /materials/class/:classId
export const listByClass: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params
    if (!isId(classId)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid classId' })
    }

    const { chapter, search, page = '1', limit = '20', type } = req.query as Record<string, string>

    const filter: any = { classId: new Types.ObjectId(classId) }
    if (chapter && isId(chapter)) {
      filter.chapter = new Types.ObjectId(chapter)
    }
    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ]
    }

    const p = Math.max(1, parseInt(page) || 1)
    const l = Math.min(100, Math.max(1, parseInt(limit) || 20))

    const [items, total] = await Promise.all([
      Material.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .populate('uploadedBy', 'username email')
        .populate('chapter', 'title')
        .lean(),
      Material.countDocuments(filter)
    ])

    return responseUtils({
      req,
      res,
      code: 200,
      message: 'OK',
      data: {
        items,
        pagination: {
          page: p,
          limit: l,
          total,
          pages: Math.ceil(total / l)
        }
      }
    })
  } catch (error: any) {
    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error'
    })
  }
}

// GET /materials/:id
export const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const material = await Material.findById(id)
      .populate('uploadedBy', 'username email')
      .populate('chapter', 'title')
      .lean()

    if (!material) {
      return responseUtils({ req, res, code: 404, message: 'Material not found' })
    }

    return responseUtils({
      req,
      res,
      code: 200,
      message: 'OK',
      data: material
    })
  } catch (error: any) {
    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error'
    })
  }
}

// DELETE /materials/:id
export const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    if (!isId(id)) {
      return responseUtils({ req, res, code: 400, message: 'Invalid id' })
    }

    const material = await Material.findById(id)
    if (!material) {
      return responseUtils({ req, res, code: 404, message: 'Material not found' })
    }

    const userId = getUserId(req)

    // Soft delete
    await (Material as any).deleteById(id, { deletedBy: userId })

    // Remove from chapter's documents array
    await Chapter.findByIdAndUpdate(
      material.chapter,
      { $pull: { documents: material._id } }
    )

    // Optional: Delete physical file
    const absolutePath = path.join(process.cwd(), 'public', material.fileUrl)
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
      console.log(`🗑️ Deleted file: ${material.fileName}`)
    }

    return responseUtils({
      req,
      res,
      code: 200,
      message: 'Material deleted successfully'
    })
  } catch (error: any) {
    return responseUtils({
      req,
      res,
      code: 500,
      message: error.message || 'Internal server error'
    })
  }
}