import { Role, RoleName } from '~/models/Role.js'

const roleService = {
  getRoles: async () => {
    try {
      const roles = await Role.find({})
      return roles
    } catch (error: any) {
      throw new Error(error)
    }
  },
  getRoleByName: async (roleName: string) => {
    try {
      const role = await Role.findOne({ name: roleName })
      return role
    } catch (error: any) {
      throw new Error(error)
    }
  }
}
export default roleService
