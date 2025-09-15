import { Router } from 'express'
import noteController from '~/controllers/NoteController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'

const noteRouter = Router()
noteRouter.get('/list', authenticationMiddleware, noteController.getNotes)
noteRouter.get('/detail/:noteId', authenticationMiddleware, noteController.getNote)
noteRouter.put('/update/:noteId', authenticationMiddleware, noteController.updateNote)
noteRouter.post('/create', authenticationMiddleware, noteController.createNote)
noteRouter.delete('/delete/:noteId', authenticationMiddleware, noteController.deleteNote)
noteRouter.delete('/delete-all', authenticationMiddleware, noteController.deleteNotes)

export default noteRouter
