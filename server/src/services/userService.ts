import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { QueryInterface } from '~/types/QueryInterface'
import { UserInterface } from '~/types/UserInterface'

const userService = {
  getUsers: async ({ limit, order, search, skip, sortBy }: QueryInterface): Promise<UserInterface[]> => {
    const users = await User.find()
      .sort(sortBy)
      .limit(limit ? limit : 0)
      .skip(skip ? skip : 0)
      .populate('roles', 'name')
      .lean<UserInterface[]>()
      .exec()
    return users
  },

  getUser: async (userId: string) => {
    const user = await User.findById(userId)
    return user
  },

  deleteUser: async (userId: string) => {
    await User.deleteOne({
      _id: userId
    })
  },

  deleteUsers: async () => {
    await User.deleteMany({})
  },

  updateUser: async (userId: string, props: UserInterface) => {
    try {
      const oldUser = await User.findOne({
        _id: userId
      })

      if (!oldUser) {
        throw new Error('User not found')
      }

      const newUser = await User.updateOne(
        {
          _id: oldUser._id
        },
        {
          username: props.username,
          email: props.email,
          password: props.password,
          roles: props.roles
        }
      )

      console.log(newUser)

      return newUser
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  softDeleteUser: async (userId: string) => {
    try {
      const deletedUser = await User.delete({
        _id: userId
      })
      return deletedUser
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  restoreUser: async (userId: string) => {
    try {
      const user = await User.restore({
        _id: userId
      })
      return user
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  findDeletedUser: async () => {
    try {
      const deletedUsers = await User.findDeleted({})
      return deletedUsers
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  countUsersByRole: async (roleName: string) => {
    try {
      // Find role by name
      const role = await Role.findOne({ name: roleName.toUpperCase() })
      if (!role) {
        return 0
      }
      
      // Count users with this role
      const count = await User.countDocuments({ roles: role._id })
      return count
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export default userService
