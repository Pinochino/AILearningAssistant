import { Router } from 'express'
import { upload } from '~/configs/multerConfig'
import xlsxController from '~/controllers/XlsxController'

const xlsxRouter = Router()

xlsxRouter.post('/upload', upload.single('file'), xlsxController.upload)

export default xlsxRouter
