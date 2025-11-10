import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '../middlewares/auth/authorizationMiddleware'
import { requireTeacherInClass } from '../middlewares/roles'
import * as aiController from '../controllers/AiController'

const aiRouter = Router()

console.log('AI Router module loaded')

// 🧠 Generate Flashcards từ Materials bằng AI
// Chỉ teacher của class hoặc admin mới được tạo
aiRouter.post(
  '/generate-flashcards',
  authenticationMiddleware,
  authorizationMiddleware,
  requireTeacherInClass('classId'),
  aiController.generateFlashcards
)

console.log('Route registered: POST /generate-flashcards')

// 🎯 Generate Quiz từ Materials bằng AI
aiRouter.post(
  '/generate-quiz',
  authenticationMiddleware,
  authorizationMiddleware,
  requireTeacherInClass('classId'),
  aiController.generateQuiz
)

console.log('Route registered: POST /generate-quiz')

export default aiRouter