import { Role, RoleName } from '~/models/Role'

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
  },
  getUsersByRoleId: async (roleId: string) => {
    try {
      const role = await Role.findById(roleId).populate('users')

      console.log(role)
      if (!role) {
        throw new Error('Role is not existed')
      }

      return role.populate('users')
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
export default roleService
