import { Router } from 'express'
import { upload } from '~/configs/multerConfig.js'
import fileController from '~/controllers/FileController.js'
import fileExtLimiter from '~/middlewares/files/fileExtLimiter.js'
import filePayloadExists from '~/middlewares/files/filePayloadExists.js'
import fileSizeLimiter from '~/middlewares/files/fileSizeLimiter.js'

const fileRouter = Router()
fileRouter.post(
  '/upload',
  upload.array('files'),
  filePayloadExists,
  fileExtLimiter(['.png', '.jpg']),
  fileSizeLimiter,
  fileController.uploadFile
)

fileRouter.get('/download/:fileName', fileController.downloadFile)

export default fileRouter
