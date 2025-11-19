import { Router } from 'express'
import { upload } from '~/configs/multerConfig.js'
import xlsxController from '~/controllers/XlsxController.js'

const xlsxRouter = Router()

xlsxRouter.post('/upload', upload.single('file'), xlsxController.upload)

export default xlsxRouter
