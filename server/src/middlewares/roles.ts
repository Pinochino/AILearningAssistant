// src/middlewares/roles.ts
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { RoleName } from '../models/Role.js'
import { Class } from '../models/class.model.js'        
import { Chapter } from '../models/Chapter.js'
import { cleanupUploadedFile } from './upload.js'

type IdSourceKey = 'classId' | 'class' | 'chapterId' | 'chapter'

function getUserId(req: any): string | undefined {
  const u = req?.user ?? {}
  return u.userId ?? u.id ?? u._id ?? u.sub
}

function getUserRoles(req: any): string[] {
  const roles = req?.user?.roles
  return Array.isArray(roles) ? roles : []
}

function isValidId(id?: string) {
  return !!id && Types.ObjectId.isValid(id)
}

/** Bắt buộc có đúng 1 role cụ thể */
export function requireRole(role: RoleName) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = getUserRoles(req)
    if (!roles.includes(role)) return res.status(403).json({ error: `Require role: ${role}` })
    next()
  }
}

/** Chấp nhận 1 trong nhiều role */
export function requireAnyRole(rolesAny: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = getUserRoles(req)
    const ok = rolesAny.some(r => roles.includes(r))
    if (!ok) return res.status(403).json({ error: `Require any role: ${rolesAny.join(', ')}` })
    next()
  }
}

/**
 * Chỉ cho phép GIÁO VIÊN của lớp (hoặc Admin) thao tác.
 * - Dùng cho: upload tài liệu, generate quiz/flashcards, sửa/xóa chapter/material/quiz
 * - Nếu idKey là chapter/chapterId, sẽ map sang classId qua Chapter.classId
 * - Đặt sau multer.single('file') nếu classId nằm trong body form-data → sẽ cleanup file nếu fail.
 */
export function requireTeacherInClass(idKey: IdSourceKey = 'classId') {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const source =
        req.body?.[idKey] ??
        req.params?.[idKey] ??
        req.query?.[idKey]

      let classId = String(source || '')

      // Map chapter -> classId nếu cần
      if ((idKey === 'chapterId' || idKey === 'chapter') && isValidId(classId)) {
        const chapter = await Chapter.findById(classId).select('classId').lean()
        if (!chapter) {
          cleanupUploadedFile(req)
          return res.status(404).json({ error: 'Chapter not found' })
        }
        classId = String(chapter.classId)
      }

      if (!isValidId(classId)) {
        cleanupUploadedFile(req)
        return res.status(400).json({ error: 'Invalid classId' })
      }

      const userId = getUserId(req)
      if (!userId) {
        cleanupUploadedFile(req)
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const roles = getUserRoles(req)
      const isAdmin = roles.includes(RoleName.SUPER_ADMIN) || roles.includes(RoleName.ADMIN)

      // Lấy lớp, cần teacherId (một giáo viên) — KHÔNG phải teachers[]
      const clazz = await Class.findById(classId).select('_id teacherId').lean()
      if (!clazz) {
        cleanupUploadedFile(req)
        return res.status(404).json({ error: 'Class not found' })
      }

      const isTeacherOfClass = String(clazz.teacherId) === String(userId)

      if (!isTeacherOfClass && !isAdmin) {
        cleanupUploadedFile(req)
        return res.status(403).json({ error: 'You are not the teacher of this class' })
      }

      next()
    } catch (e: any) {
      cleanupUploadedFile(req)
      res.status(500).json({ error: e.message })
    }
  }
}

/**
 * Cho phép THÀNH VIÊN lớp (giáo viên của lớp, học sinh trong lớp, hoặc Admin)
 * - Dùng cho: list xem materials/quizzes/flashcards trong lớp, student xem tài liệu...
 */
export function requireMemberInClass(idKey: IdSourceKey = 'classId') {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const source =
        req.body?.[idKey] ??
        req.params?.[idKey] ??
        req.query?.[idKey]

      let classId = String(source || '')

      if ((idKey === 'chapterId' || idKey === 'chapter') && isValidId(classId)) {
        const chapter = await Chapter.findById(classId).select('classId').lean()
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' })
        classId = String(chapter.classId)
      }

      if (!isValidId(classId)) return res.status(400).json({ error: 'Invalid classId' })

      const userId = getUserId(req)
      if (!userId) return res.status(401).json({ error: 'Unauthorized' })

      // Lấy teacherId + students[]
      const clazz = await Class.findById(classId).select('_id teacherId students').lean()
      if (!clazz) return res.status(404).json({ error: 'Class not found' })

      const isTeacher = String(clazz.teacherId) === String(userId)
      const isStudent = (clazz.students || []).some((s: any) => String(s) === String(userId))
      const roles = getUserRoles(req)
      const isAdmin = roles.includes(RoleName.SUPER_ADMIN) || roles.includes(RoleName.ADMIN)

      if (!isTeacher && !isStudent && !isAdmin) {
        return res.status(403).json({ error: 'You are not a member of this class' })
      }

      next()
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  }
}
