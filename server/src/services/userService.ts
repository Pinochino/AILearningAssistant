import { User } from '~/models/User'
import { Role } from '~/models/Role'
import { QueryInterface } from '~/types/QueryInterface'
import { EditUserInterface, UserInterface } from '~/types/UserInterface'
import mongoose from 'mongoose'

const userService = {
  getUsers: async ({ limit, order, search, skip, sortBy }: QueryInterface): Promise<UserInterface[]> => {
    const users = await User.find(
      search
        ? {
          $or: [
            { username: search },
            { name: search }
          ]
        }
        : {}
    )
      .sort(sortBy)
      .limit(limit ? limit : 0)
      .skip(skip ? skip : 0)
      .populate('roles', 'name')
      .lean<UserInterface[]>()
      .select('username name email createdAt isActive lastLogin')
      .exec()
    return users
  },

  getUser: async (userId: string) => {
    const user = await User.findById(userId).populate('roles name')
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
      const oldUser = await User.findById(userId)
      if (!oldUser) throw new Error('User not found')

      console.log('old user: ', oldUser.username)

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { username: props.username, name: props.name } },
        { new: true }
      )

      if (props.removeRoleId) {
        await User.findByIdAndUpdate(userId, { $pull: { roles: props.removeRoleId } })
      }

      if (props.addRoleId) {
        await User.findByIdAndUpdate(userId, { $addToSet: { roles: props.addRoleId } })
      }

      const newUser = await User.findById(userId)
      console.log('updated user: ', newUser)

      return newUser
    } catch (error: any) {
      console.error('Update error:', error.message)
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
  },

  countUsersByActive: async () => {
    try {
      const userCount = await User.countDocuments({
        isActive: true
      })
      return userCount
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  getUsersByRoleId: async (roleId: string) => {
    try {
      const users = await User.find({ roles: roleId }).populate('roles')

      return users
    } catch (error: any) {
      throw new Error(`Failed to get users by roleId: ${error.message}`)
    }
  }
}

export default userService
