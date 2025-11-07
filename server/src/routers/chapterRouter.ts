// src/routers/chapterRouter.ts
import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware'
import { create, listByClassId, update, remove } from '../controllers/ChapterController'

const chapterRouter = Router()

chapterRouter.use(authenticationMiddleware)

chapterRouter.post('/', create)
chapterRouter.get('/class/:classId', listByClassId)
chapterRouter.patch('/:id', update)
chapterRouter.delete('/:id', remove)

export default chapterRouter