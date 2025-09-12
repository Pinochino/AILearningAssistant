import { NextFunction, Response } from 'express'

const MB = 5 // 5MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024 * 1024

export default function fileSizeLimiter(req: any, res: Response, next: NextFunction) {
  const files = req.files

  const filesOverLimit: string[] = []

  Object.keys(files).forEach((key) => {
    if (files[key].size > FILE_SIZE_LIMIT) {
      filesOverLimit.push(files[key].name)
    }
  })

  if (filesOverLimit.length) {
    const properVerb = filesOverLimit.length > 1 ? 'are' : 'is'

    const sentence =
      `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`.replaceAll(
        ',',
        ', '
      )

    const message = filesOverLimit.length < 3 ? sentence.replace(',', ' and') : sentence.replace(/,(?=[^,]*$)/, ' and')

    res.status(413).json({ status: 'error', message })
    return
  }

  next()
}
