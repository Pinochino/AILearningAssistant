import { Router } from 'express'
import authenticationMiddleware from '../middlewares/auth/authenticationMiddleware.js'
import * as fsc from '../controllers/FlashcardSetController.js'

const r = Router()

// Add authentication middleware
r.use(authenticationMiddleware)

// ✅ CRUD operations for Flashcard Sets
r.post('/', fsc.create)
r.get('/', fsc.listAll) // Add endpoint to get all flashcard sets
r.get('/class/:classId', fsc.listByClass)
r.get('/:id', fsc.getById)
r.patch('/:id', fsc.update)
r.delete('/:id', fsc.remove)

export default r
