import dotenv from 'dotenv'
dotenv.config()
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayloadInterface } from '~/types/JwtPayload'

export default function authenticationMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1]
    console.log('Auth middleware - Token:', accessToken ? 'Present' : 'Missing')

    if (!accessToken) {
      console.log('Auth middleware - No token provided')
      res.status(400).json({ error: `You dont't have permission to access` })
      return
    }
    const verifiedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY as string)

    if (!verifiedToken) {
      console.log('Auth middleware - Token verification failed')
      res.status(400).json({ error: `Access token is wrong` })
      return
    }

    const decodedToken = jwt.decode(accessToken) as JwtPayloadInterface
    req.user = decodedToken
    console.log('Auth middleware - User:', decodedToken.id)
    next()
  } catch (error: any) {
    console.log('Auth middleware - Error:', error.message)
    res.status(500).json({ error: error.message })
  }
}
