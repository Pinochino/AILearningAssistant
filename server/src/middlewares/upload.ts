import multer from 'multer'
import path from 'path'
import fs from 'fs'

const ensureDirectoryExistence = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log('✅ Created directory:', dirPath) // Log để debug
  }
  return true
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve('public/uploads/materials')
    console.log('📁 Upload path:', uploadPath) // Log để debug
    
    try {
      ensureDirectoryExistence(uploadPath)
      cb(null, uploadPath)
    } catch (err: any) {
      console.error('❌ Error creating directory:', err)
      cb(err, uploadPath)
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.\-() ]+/g, '_')
    cb(null, Date.now() + '_' + safeName)
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
})

export function cleanupUploadedFile(req: any) {
  const filePath = req?.file?.path
  if (filePath) {
    fs.promises.unlink(filePath).catch(() => {})
  }
}