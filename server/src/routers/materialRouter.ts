// src/routers/materialRouter.ts
import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '../middlewares/auth/authorizationMiddleware'
import { upload } from '../middlewares/upload'
import { requireTeacherInClass, requireMemberInClass } from '../middlewares/roles'
import * as mat from '../controllers/MaterialController'

const router = Router()

// TEACHER của class mới được upload
router.post(
  '/',
  authenticationMiddleware,
  authorizationMiddleware,
  upload.single('file'),
  requireTeacherInClass('classId'),
  (req, res, next) => {
    console.log('Received POST request to /api/materials')
    console.log('File:', req.file) // Log thông tin file
    console.log('Body:', req.body) // Log thông tin body
    next()
  },
  mat.upload
)

// Tạo từ link (không upload file) – TEACHER
router.post(
  '/link',
  authenticationMiddleware,
  authorizationMiddleware,
  requireTeacherInClass('classId'),
  mat.createFromLink
)

// Xem material theo class/chapter – thành viên lớp
router.get(
  '/class/:classId',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('classId'),
  mat.listByClass
)

router.get(
  '/chapter/:chapterId',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('chapterId'),
  mat.listByChapter
)

// Xem chi tiết 1 material
router.get('/:id', authenticationMiddleware, authorizationMiddleware, mat.getOne)

// Sửa/Xóa/Khôi phục – (tùy bạn có thể siết chặt hơn để chỉ teacher chỉnh sửa)
router.patch('/:id', authenticationMiddleware, authorizationMiddleware, mat.update)
router.delete('/:id', authenticationMiddleware, authorizationMiddleware, mat.remove)
router.patch('/:id/restore', authenticationMiddleware, authorizationMiddleware, mat.restore)

export default router
