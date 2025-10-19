import { NextFunction, Response } from 'express'
import { RoleName } from '~/models/Role'
import { User } from '~/models/User'

export default function authorizationMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const data = req?.user
    if (!data) {
      res.status(400).json({ error: `You dont't have permission to access` })
      return
    }

    let userRoles: string[] = Array.from(data.roles || [])

    // If roles are missing or empty in JWT, try to load from DB
    if (!userRoles.length && data.id) {
      // Fetch the user and populate role names
      // Note: this is a safe fallback for tokens created without roles
      User.findById(data.id)
        .populate('roles', 'name')
        .then((user: any) => {
          if (user && Array.isArray(user.roles)) {
            userRoles = user.roles.map((r: any) => r.name)
            req.user.roles = userRoles
          }

          const hasAdminRole = userRoles.includes(RoleName.SUPER_ADMIN) || userRoles.includes(RoleName.ADMIN)
          const hasTeacherRole = userRoles.includes(RoleName.TEACHER)
          const hasStudentRole = userRoles.includes(RoleName.STUDENT)

          if (!hasAdminRole && !hasTeacherRole && !hasStudentRole) {
            res.status(403).json({ err: "You don't have right to access" })
            return
          }

          next()
        })
        .catch((err: any) => {
          res.status(500).json({ error: err.message })
        })
      return
    }

    const hasAdminRole = userRoles.includes(RoleName.SUPER_ADMIN) || userRoles.includes(RoleName.ADMIN)
    const hasTeacherRole = userRoles.includes(RoleName.TEACHER)
    const hasStudentRole = userRoles.includes(RoleName.STUDENT)

    // Allow access for admin, teacher, or student roles
    if (!hasAdminRole && !hasTeacherRole && !hasStudentRole) {
      res.status(403).json({ err: "You don't have right to access" })
      return
    }

    next()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
    return
  }
}
