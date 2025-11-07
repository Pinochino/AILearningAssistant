import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '../middlewares/auth/authorizationMiddleware'
import { requireTeacherInClass } from '../middlewares/roles'
import * as aiController from '../controllers/AiController'

const aiRouter = Router()

console.log('🤖 AI Router module loaded') // ✅ Thêm log


// 🧠 Generate Flashcards từ Materials bằng AI
// Chỉ teacher của class hoặc admin mới được tạo
aiRouter.post(
  '/generate-flashcards',
  authenticationMiddleware,           // 1️⃣ Check đã login
  authorizationMiddleware,            // 2️⃣ Check role hợp lệ
  requireTeacherInClass('classId'),   // 3️⃣ Check teacher của class
  aiController.generateFlashcards
)

console.log('✅ Route registered: POST /generate-flashcards') // ✅ Thêm log


// 🎯 Generate Quiz từ Materials bằng AI (TODO)
aiRouter.post(
  '/generate-quiz',
  authenticationMiddleware,
  authorizationMiddleware,
  requireTeacherInClass('classId'),
  aiController.generateQuiz
)

export default aiRouter