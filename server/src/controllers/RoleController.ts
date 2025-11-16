import { Request, Response } from 'express'
import roleService from '~/services/roleService.js'
import { responseUtils } from '~/utils/ResponseUtils.js'

const roleController = {
  getRoles: async (req: Request, res: Response) => {
    try {
      const roles = await roleService.getRoles()
      responseUtils({ req, res, code: 200, message: `Get roles successfully`, data: roles })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },
  getRoleByName: async (req: Request, res: Response) => {
    try {
      const { roleName } = req.params
      const role = await roleService.getRoleByName(roleName)
      responseUtils({ req, res, code: 200, message: `Get Role Succesfully`, data: role })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}

export default roleController
