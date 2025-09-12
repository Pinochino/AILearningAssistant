import { NextFunction, Request, Response } from 'express'
import path from 'path'

export default function fileExtLimiter(allowExtArray: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const files: any = req.files

    const fileExtension: string[] = []

    Object.keys(files).forEach((key) => {
      fileExtension.push(path.extname(files[key].originalname))
    })

    const allowed = fileExtension.every((ext) => allowExtArray?.includes(ext))

    if (!allowed) {
      const message = `Upload failed. Only ${allowExtArray.toString()} files allowed.`.replaceAll(',', ', ')
      res.status(400).json({ error: message })
      return
    }

    next()
  }
}
