import { Role, RoleName } from '~/models/Role'
import { User } from '~/models/User'
import { QueryInterface } from '~/types/QueryInterface'
import { EditUserInterface, UserInterface } from '~/types/UserInterface'

const userService = {
  getUsers: async ({ limit, order, search, skip, sortBy }: QueryInterface): Promise<UserInterface[]> => {
    const users = await User.find(
      search
        ? {
            $or: [
              {
                username: search
              },
              {
                email: search
              }
            ]
          }
        : {}
    )
      .sort(sortBy)
      .limit(limit ? limit : 0)
      .skip(skip ? skip : 0)
      .populate('roles', 'name')
      .lean<UserInterface[]>()
      .select('username email createdAt isActive lastLogin')
      .exec()
    return users
  },

  getUser: async (userId: string) => {
    const user = await User.findById(userId).populate('roles', 'name')
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

  updateUser: async (userId: string, props: EditUserInterface) => {
    try {
      const oldUser = await User.findOne({
        _id: userId
      })

      if (!oldUser) {
        throw new Error('User not found')
      }

      if (props.addRoleId || props.removeRoleId) {
        if (props.removeRoleId) {
          await User.findByIdAndUpdate(oldUser._id, {
            $pull: { roles: props.removeRoleId }
          })
        }

        if (props.addRoleId) {
          await User.findByIdAndUpdate(oldUser._id, {
            $addToSet: { roles: props.addRoleId }
          })
        }
      }

      const newUser = await User.findById(oldUser._id)

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

  countUserByRole: async (roleName: string) => {
    try {
      const oldRole = await Role.findOne({
        name: roleName
      })

      if (!oldRole) {
        throw new Error('Not found role')
      }

      const usersNumber = await User.countDocuments({
        roles: {
          $in: {
            _id: [oldRole._id]
          }
        }
      })

      return usersNumber
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  countUserIsActive: async () => {
    try {
      const userNums = await User.countDocuments({
        isActive: true
      })
      return userNums
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export default userService
