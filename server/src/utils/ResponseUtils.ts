import { Request, Response } from 'express'

interface IResponse {
  req: Request
  res: Response
  code: number
  message?: string
  data?: any
}

export const responseUtils = ({ req, res, code, message, data }: IResponse) => {
  res.status(code).json({
    msg: message,
    data
  })
  return
}
