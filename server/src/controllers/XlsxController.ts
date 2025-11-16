import { Request, Response } from 'express'
import { responseUtils } from '~/utils/ResponseUtils.js'
import * as XLSX from 'xlsx'
import fs from 'fs'

const xlsxController = {
  upload: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        responseUtils({ req, res, code: 400, message: `Not found file` })
      }

      const buf = fs.readFileSync(req.file?.path as string)

      const wb = XLSX.read(buf, { type: 'buffer' })

      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        responseUtils({ req, res, code: 400, message: `No sheets found in uploaded file` })
      }

      const ws = wb.Sheets[wb.SheetNames[0]]

      const data = XLSX.utils.sheet_to_json(ws)

      responseUtils({ req, res, code: 200, message: `Upload file successfully`, data })
    } catch (error: any) {
      responseUtils({ req, res, code: 500, message: error.message })
    }
  }
}

export default xlsxController
