import { Request, Response } from 'express'
import roleService from '~/services/roleService'
import userService from '~/services/userService'
import { responseUtils } from '~/utils/ResponseUtils'

const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const { limit, order, search, skip, sortBy } = req.query
      console.log(search)
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
      const result = await userService.updateUser(userId, req.body)
      responseUtils({ req, res, code: 400, message: `Update user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  softDelete: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const result = await userService.softDeleteUser(userId)
      responseUtils({ req, res, code: 400, message: `Soft delete user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  restoreUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params
      const result = await userService.restoreUser(userId)
      responseUtils({ req, res, code: 400, message: `Restore user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  findDeletedUsers: async (req: Request, res: Response) => {
    try {
      const result = await userService.findDeletedUser()
      responseUtils({ req, res, code: 400, message: `Get all deleted user successfully`, data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  countUserByRoleName: async (req: Request, res: Response) => {
    try {
      const { roleName } = req.params
      const usersNumber = await userService.countUserByRole(roleName)
      responseUtils({ req, res, code: 200, message: `Get users by role success`, data: usersNumber })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  countUserActive: async (req: Request, res: Response) => {
    try {
      const usersNumber = await userService.countUserIsActive()
      responseUtils({ req, res, code: 200, message: `Get users isActive`, data: usersNumber })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}

export default userController
