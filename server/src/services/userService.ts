import { User } from '../models/User'
import { QueryInterface } from '../types/QueryInterface'
import { UserInterface } from '../types/UserInterface'

const userService = {
  getUsers: async ({ limit, order, search, skip, sortBy }: QueryInterface): Promise<UserInterface[]> => {
    const lim = typeof limit === 'string' ? parseInt(limit, 10) : (limit || 0)
    const sk = typeof skip === 'string' ? parseInt(skip, 10) : (skip || 0)
    const q = typeof search === 'string' ? search.trim() : ''
    const sort: any = sortBy && Object.keys(sortBy as any).length ? sortBy : { createdAt: -1 }

    const filter: any = q
      ? {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
      }
      : {}

    const users = await User.find(filter)
      .sort(sort)
      .limit(Number.isFinite(lim) ? lim : 0)
      .skip(Number.isFinite(sk) ? sk : 0)
      .populate('roles', 'name')
      .select('username email')
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
  }
}

export default userService
