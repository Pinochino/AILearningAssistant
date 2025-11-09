import { NextFunction, Response } from 'express'
import { Role, RoleName } from '~/models/Role'

export default function authorizationMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const data = req?.user

    if (!data) {
      res.status(400).json({ error: `You dont't have permission to access` })
      return
    }

    const adminRole = Array.from(data.roles).includes(RoleName.ADMIN)

    if (!adminRole) {
      res.status(403).json({ err: "You don't have right to access" })
      return
    }

    next()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
    return
  }
}
