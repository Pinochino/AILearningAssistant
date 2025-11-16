// AILearningAssistant\server\src\routers\quizRouter.ts
import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware.js'
import * as qz from '../controllers/QuizController.js'

const r = Router()

// Add authentication middleware
r.use(authenticationMiddleware)

// ✅ CRUD operations
r.post('/', qz.create)
r.post('/:id/questions/bulk', qz.addQuestionsBulk)
r.get('/', qz.listAll) // Add endpoint to get all quizzes
r.get('/class/:classId', qz.listByClass)
r.get('/:id', qz.getOne)
r.patch('/:id', qz.update)
r.patch('/:id/publish', qz.publish)
r.delete('/:id', qz.remove)
r.patch('/:id/restore', qz.restore)

// 🆕 Submit & History
r.post('/:id/submit', qz.submitQuiz)
r.get('/:id/attempts', qz.getQuizAttempts)
r.get('/:id/statistics', qz.getQuizStats)
r.get('/attempts/my-history', qz.getMyQuizHistory)
r.get('/attempts/:attemptId', qz.getAttemptDetail)

export default r