import { Router } from 'express'
import * as qz from '../controllers/QuizController'

const r = Router()

// ✅ CRUD operations
r.post('/', qz.create)
r.post('/:id/questions/bulk', qz.addQuestionsBulk)
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