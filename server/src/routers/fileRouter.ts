import { Router } from "express";
import { upload } from "~/configs/multerConfig";
import fileController from "~/controllers/FileController";
import fileExtLimiter from "~/middlewares/files/fileExtLimiter";
import filePayloadExists from "~/middlewares/files/filePayloadExists";
import fileSizeLimiter from "~/middlewares/files/fileSizeLimiter";

const fileRouter = Router();
fileRouter.post('/upload',
  upload.array('files'),
  filePayloadExists,
  fileExtLimiter(['.png', '.jpg']),
  fileSizeLimiter,
  fileController.uploadFile);

fileRouter.get('/download/:fileName', fileController.downloadFile)

export default fileRouter;