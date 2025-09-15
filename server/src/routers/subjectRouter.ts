import { Router } from 'express'
import subjectController from '~/controllers/SubjectController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'

const subjectRouter = Router()
subjectRouter.get('/list', authenticationMiddleware, subjectController.getSubjects)
subjectRouter.get('/detail/:subjectId', authenticationMiddleware, subjectController.getSubject)
subjectRouter.put('/update/:subjectId', authenticationMiddleware, subjectController.updateSubject)
subjectRouter.post('/create', authenticationMiddleware, subjectController.createSubject)
subjectRouter.delete('/delete/:subjectId', authenticationMiddleware, subjectController.deleteSubject)
subjectRouter.delete('/delete-all', authenticationMiddleware, subjectController.deleteSubjects)

export default subjectRouter
