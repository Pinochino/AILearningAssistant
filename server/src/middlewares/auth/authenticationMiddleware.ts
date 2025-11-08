import dotenv from 'dotenv'
dotenv.config()
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JwtResponse } from '~/types/JwtResponse'

export default function authenticationMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      res.status(400).json({ error: `You dont't have permission to access` })
      return
    }
    const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string)

    if (!verifiedToken) {
      res.status(400).json({ error: `Access token is wrong` })
      return
    }

    const decodedToken = jwt.decode(accessToken) as JwtResponse
    req.user = decodedToken
    next()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
