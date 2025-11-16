import { Request, Response } from 'express'
import userService from '~/services/userService.js'
import { responseUtils } from '~/utils/ResponseUtils.js'

const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const { limit, order, search, skip, sortBy } = req.query
      const users = await userService.getUsers(req.query)
      responseUtils({ req, res, code: 200, message: `Get user successfully`, data: users })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  getUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const user = await userService.getUser(userId)
      responseUtils({ req, res, code: 200, message: `Get user successfully`, data: user })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteOne: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      await userService.deleteUser(userId)
      responseUtils({ req, res, code: 200, message: `Delete user successfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  deleteMany: async (req: Request, res: Response) => {
    try {
      await userService.deleteUsers()
      responseUtils({ req, res, code: 200, message: `Delete all user success` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      console.log(`User ID: ${userId}`)
      const result = await userService.updateUser(userId, req.body)
      responseUtils({ req, res, code: 200, message: `Update user successfully`, data: result })
    } catch (error: any) {
      console.log(error.message)
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  softDelete: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const result = await userService.softDeleteUser(userId)
      responseUtils({ req, res, code: 200, message: `Soft delete user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  restoreUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const result = await userService.restoreUser(userId)
      responseUtils({ req, res, code: 200, message: `Restore user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  findDeletedUsers: async (req: Request, res: Response) => {
    try {
      const result = await userService.findDeletedUser()
      responseUtils({ req, res, code: 200, message: `Get all deleted user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  countUserByRole: async (req: Request, res: Response) => {
    try {
      const { roleName } = req.params as { roleName: string }
      const count = await userService.countUsersByRole(roleName)
      responseUtils({ req, res, code: 200, message: `Get count by role successfully`, data: count })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  countUsesByActive: async (req: Request, res: Response) => {
    try {
      const userCount = await userService.countUsersByActive()
      responseUtils({ req, res, code: 200, message: `Count users by isActive successfully`, data: { userCount } })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  filterUserByRoleId: async (req: Request, res: Response) => {
    try {
      const { roleId } = req.params
      const users = await userService.getUsersByRoleId(roleId)
      responseUtils({ req, res, code: 200, message: `Filter users by roleId successfully`, data: { users } })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}

export default userController
