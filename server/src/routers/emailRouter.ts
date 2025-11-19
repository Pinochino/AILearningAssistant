import { Router } from 'express'
import { upload } from '~/configs/multerConfig.js'
import emailController from '~/controllers/EmailController.js'

const emailRouter = Router()
emailRouter.post('/send', upload.array('files'), emailController.sendEmailWithAttackment)

export default emailRouter
