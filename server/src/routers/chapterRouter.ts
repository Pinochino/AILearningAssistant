// src/routers/chapterRouter.ts
import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware'
import { create, listByClassId, update, remove, restore } from '../controllers/ChapterController'
import { getOne } from '~/controllers/ChapterController'

const chapterRouter = Router()

chapterRouter.use(authenticationMiddleware)

chapterRouter.post('/', create)
chapterRouter.get('/class/:classId', listByClassId)
chapterRouter.get('/:id', getOne)
chapterRouter.patch('/:id', update)
chapterRouter.patch('/:id/restore', restore)
chapterRouter.delete('/:id', remove)

export default chapterRouter