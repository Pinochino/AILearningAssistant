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
  mat.uploadMaterial
)

// Xem material theo class/chapter – thành viên lớp
router.get(
  '/class/:classId',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('classId'),
  mat.listByClass
)

// Xem chi tiết 1 material
router.get('/:id', authenticationMiddleware, authorizationMiddleware, mat.getOne)


router.delete('/:id', authenticationMiddleware, authorizationMiddleware, mat.remove)

export default router
