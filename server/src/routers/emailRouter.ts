import { Router } from 'express'
import { upload } from '~/configs/multerConfig'
import emailController from '~/controllers/EmailController'

const emailRouter = Router()
emailRouter.post('/send', upload.array('files'), emailController.sendEmailWithAttackment)

export default emailRouter
