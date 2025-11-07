import { Router } from 'express'
import * as qz from '../controllers/QuizController'

const r = Router()

r.post('/quizzes', qz.create)
r.post('/quizzes/:id/questions/bulk', qz.addQuestionsBulk)
r.get('/quizzes/class/:classId', qz.listByClass)
r.get('/quizzes/:id', qz.getOne)
r.patch('/quizzes/:id', qz.update)
r.patch('/quizzes/:id/publish', qz.publish)
r.delete('/quizzes/:id', qz.remove)
r.patch('/quizzes/:id/restore', qz.restore)

export default r
