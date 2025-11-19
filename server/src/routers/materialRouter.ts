// src/routers/materialRouter.ts
import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware.js'
import authorizationMiddleware from '../middlewares/auth/authorizationMiddleware.js'
import { upload } from '../middlewares/upload.js'
import { requireTeacherInClass, requireMemberInClass } from '../middlewares/roles.js'
import * as mat from '../controllers/MaterialController.js'

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
  mat.uploadMaterial
)

router.get('/', mat.listAll) // Add endpoint to get all materials

// Xem material theo class/chapter – thành viên lớp
router.get(
  '/class/:classId',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('classId'),
  mat.listByClass
)

// Xem tài liệu của một chương thuộc lớp
router.get(
  '/class/:classId/chapter/:chapterId', // API mới
  mat.getMaterialsForChapter
)

// Xem chi tiết 1 material
router.get('/:id', authenticationMiddleware, authorizationMiddleware, mat.getOne)

// Cập nhật material - chỉ teacher của class mới được cập nhật
router.put(
  '/:id',
  authenticationMiddleware,
  authorizationMiddleware,
  requireTeacherInClass('classId'),
  mat.update
)

router.delete('/:id', authenticationMiddleware, authorizationMiddleware, mat.remove)

export default router
