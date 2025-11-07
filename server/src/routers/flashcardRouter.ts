import { Router } from 'express'
import * as fc from '../controllers/FlashcardController'

const r = Router()

// ✅ Bỏ prefix '/flashcards' vì đã có trong routers.ts
r.post('/', fc.create)
r.post('/bulk', fc.bulkCreate)
r.get('/class/:classId', fc.listByClass)
r.get('/chapter/:chapterId', fc.listByChapter)
r.get('/:id', fc.getOne)
r.patch('/:id', fc.update)
r.delete('/:id', fc.remove)
r.patch('/:id/restore', fc.restore)

export default r