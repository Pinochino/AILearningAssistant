import multer from 'multer'
import { Request } from 'express'
import path from 'path'
import fs from 'fs'

export const uploadFolder = path.join(__dirname, 'public', 'uploads')

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}


const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, uploadFolder)
  },
  filename: function (req: Request, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })
