import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware.js'
import authorizationMiddleware from '../middlewares/auth/authorizationMiddleware.js'
import { requireMemberInClass, requireTeacherInClass } from '../middlewares/roles.js'
import * as aiController from '../controllers/AiController.js'

const aiRouter = Router()


// Generate Flashcards từ Materials bằng AI
// Chỉ teacher của class hoặc admin mới được tạo
aiRouter.post(
  '/generate-flashcards',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('classId'),
  aiController.generateFlashcards
)



// Generate Quiz từ Materials bằng AI
aiRouter.post(
  '/generate-quiz',
  authenticationMiddleware,
  authorizationMiddleware,
  requireMemberInClass('classId'),
  aiController.generateQuiz
)


export default aiRouter