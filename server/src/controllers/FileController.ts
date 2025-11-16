import { Request, Response } from 'express'
import path from 'path'
import { uploadFolder } from '~/configs/multerConfig.js'

const fileController = {
  downloadFile: async (req: Request, res: Response) => {
    const { fileName } = req.params
    const file = path.join(uploadFolder, `${fileName}`)
    res.download(file)
  },

  uploadFile: async (req: Request, res: Response) => {
    const files = req.files
    console.log(files)
    res.send({ msg: `Upload file successfully` })
    return
  }
}

export default fileController
