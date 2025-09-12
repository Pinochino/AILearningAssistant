import { NextFunction, Request, Response } from 'express'

export default function filePayloadExists(req: Request, res: Response, next: NextFunction) {
  if (!req.files) {
    res.status(400).json({ error: `Missing file` })
    return
  }

  next()
}
