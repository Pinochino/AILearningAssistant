import { User } from '~/models/User.js'
import { LoginType, RegisterType } from '~/types/UserInterface.js'
import { compareHashed } from '~/utils/BcryptUtils.js'
import { ValidatedToken, ValidatedTokenStatus } from '~/models/ValidatedToken.js'
import { Role, RoleName } from '~/models/Role.js'
import { createLoginResponse, generateAccessToken } from '~/utils/JwtUtils.js'
import { ForgotPassword } from '~/models/ForgotPassword.js'

const authService = {
  authenticate: async ({ username, password }: LoginType) => {
    try {
      console.log('Login attempt:', { username })

      const user = await User.findOne({ username }).populate('roles', 'name')

      if (!user) {
        console.log('User not found:', username)
        throw new Error('Invalid credentials')
      }

      console.log('User found:', {
        id: user._id,
        username: user.username,
        roles: user.roles,
        hasPassword: !!user.password
      })

      const isValid = await compareHashed(password as string, user.password as string)

      if (!isValid) {
        console.log('Invalid password for:', username)
        throw new Error('Invalid credentials')
      }

      await User.updateOne({ _id: user._id }, { $set: { isActive: true, lastLogin: Date.now() } })

      console.log('Password valid, creating login response')
      return await createLoginResponse(user)
    } catch (error: any) {
      console.error('Login error (authService.authenticate):', error)

      // Sai tài khoản / mật khẩu → ném đúng message đó cho controller xử lý 401
      if (error?.message === 'Invalid credentials') {
        throw error
      }

      // Các lỗi khác (JWT, DB, v.v.) → để controller trả 500
      throw new Error('Internal login error')
    }
  },

  createUser: async ({ name, username, password, roles }: RegisterType) => {
    try {
      let user = await User.findOne({ username })

      if (user) {
        throw new Error('User already have been existed')
      }

      const rolePromises = Array.from(roles).map(async (r) => {
        const role = await Role.findOne({
          _id: r,
          name: { $ne: RoleName.ADMIN }
        })
        return role._id
      })

      const newRoles = (await Promise.all(rolePromises)).filter(Boolean)

      console.log(`newRoles: `, newRoles)

      user = await User.create({ name, username, password, roles: newRoles })

      // await emailService.sendEmail({
      //   from: 'Tranhunghp22112004@gmail.com',
      //   to: user.email as string,
      //   subject: 'Welcome to LearningAssistant',
      //   template: 'welcome',
      //   context: { username: user.username }
      // })

      await user.populate('roles', 'name')
      return user
    } catch (error: any) {
      throw new Error('Error in register: ' + error?.message)
    }
  },

  refreshToken: async (refreshToken: string) => {
    const validToken = await ValidatedToken.findOne({
      token: refreshToken
    })

    if (!validToken) {
      throw new Error('Refresh token is wrong')
    }

    const user = await User.findById(validToken?.userId).populate('roles', 'name')

    if (!user) {
      throw new Error('User id is not valid')
    }

    if (validToken.status !== ValidatedTokenStatus.ACTIVE) {
      throw new Error('Refresh token is not active')
    }

    const checkTime = validToken.expiredAt

    if (!checkTime) {
      throw new Error('Expired at is null')
    }

    if (checkTime < new Date()) {
      validToken.status = ValidatedTokenStatus.EXPIRED
      await validToken.save()
      throw new Error('Refresh token is expired')
    }

    const accessToken = generateAccessToken(user)

    return {
      accessToken: accessToken
    }
  },

  logout: async (refreshToken: string) => {
    const oldRefreshToken = await ValidatedToken.findOne({
      token: refreshToken
    })

    if (!oldRefreshToken) {
      throw new Error('Refresh token is wrong')
    }

    const user = await User.findById(oldRefreshToken.userId)

    if (!user) {
      throw new Error('Invalid userId')
    }

    oldRefreshToken.status = ValidatedTokenStatus.REVOKED
    await oldRefreshToken.save()
  },

  cleanUpTokens: async () => {
    await ValidatedToken.deleteMany({
      $or: [
        { status: ValidatedTokenStatus.EXPIRED },
        { status: ValidatedTokenStatus.REVOKED },
        { expiredAt: { $lt: new Date() } }
      ]
    })
  },

  // sendOtp: async (email: string) => {
  //   const user = await User.findOne({ email })

  //   if (!user) {
  //     throw new Error('Email is wrong')
  //   }

  //   const otp = Math.floor(100000 + Math.random() * 900000)

  //   await emailService.sendEmail({
  //     from: 'Tranhunghp22112004@gmail.com',
  //     to: user.email as string,
  //     subject: 'Forgot password',
  //     text: `Your otp is ${otp}`
  //     // template: 'otp',
  //     // context: { otp: otp }
  //   })

  //   await ForgotPassword.create({
  //     otp,
  //     userId: user.id,
  //     expired: new Date(Date.now() + 30 * 1000)
  //   })

  //   return otp
  // },

  verifyOtp: async (otp: string, email: string) => {
    try {
      const user = await User.findOne({
        email
      })

      if (!user) {
        throw new Error('Email is wrong')
      }

      const checkOtp = await ForgotPassword.findOne({
        otp,
        expiredAt: { $gte: new Date() },
        userId: user._id,
        isUsed: false
      })
      return checkOtp
    } catch (error: any) {
      throw new Error(error)
    }
  },

  forgotPassword: async (otp: string, email: string, newPassword: string) => {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Email is wrong')
    }

    const oldForgotPassword = await ForgotPassword.findOne({
      userId: user._id,
      otp
    })

    if (!oldForgotPassword) {
      throw new Error('Otp or email is wrong')
    }

    user.password = newPassword
    await user.save()

    oldForgotPassword.isUsed = true
    await oldForgotPassword.save()
  },

  cleanUpOtps: async () => {
    await ForgotPassword.deleteMany({
      $or: [
        {
          expiredAt: {
            $lt: new Date()
          }
        },
        {
          isUsed: true
        }
      ]
    })
  },

  updatePassword: async (userId: string, newPassword: string) => {
    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    user.password = newPassword
    await user.save()
  }
}
export default authService
