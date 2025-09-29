import { User } from '~/models/User'
import { TokenResponse } from '~/types/TokenResponse'
import { LoginType, RegisterType } from '~/types/UserInterface'
import { compareHashed } from '~/utils/BcryptUtils'
import { ValidatedToken, ValidatedTokenStatus } from '~/models/ValidatedToken'
import { Role, RoleName } from '~/models/Role'
import emailService from './emailService'
import { createLoginResponse, generateAccessToken } from '~/utils/JwtUtils'
import { ForgotPassword } from '~/models/ForgotPassword'

const authService = {
  authenticate: async ({ email, password }: LoginType) => {
    try {
      const user = await User.findOne({ email }).populate('roles', 'name')

      if (!user) {
        throw new Error('Invalid credentials')
      }

      const isValid = await compareHashed(password as string, user.password as string)

      if (!isValid) {
        throw new Error('Invalid credentials')
      }

      await User.updateOne(
        {
          _id: user._id
        },
        {
          isActive: true,
          lastLogin: new Date()
        }
      )

      return createLoginResponse(user)
    } catch (error: any) {
      throw new Error('Error in login: ' + error?.message)
    }
  },

  createUser: async ({ email, username, password, roles }: RegisterType) => {
    try {
      // 1. Kiểm tra user tồn tại
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new Error('User already exists')
      }

      // 2. Lấy danh sách roles hợp lệ (ngoại trừ SUPER_ADMIN)
      const roleDocs = await Role.find({
        _id: { $in: roles },
        name: { $ne: RoleName.SUPER_ADMIN }
      })

      if (!roleDocs.length) {
        throw new Error('No valid roles found')
      }

      const roleIds = roleDocs.map((role) => role._id)

      // 3. Tạo user
      const user = await User.create({
        username,
        email,
        password,
        roles: roleIds
      })

      // 4. Cập nhật roles để gán user (nếu Role có field "users")
      await Role.updateMany({ _id: { $in: roleIds } }, { $addToSet: { users: user._id } })

      // 5. Populate role name cho user
      await user.populate('roles', 'name')

      return user
    } catch (error: any) {
      throw new Error(`Error in register: ${error.message}`)
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

    await User.updateOne(
      {
        _id: user._id
      },
      {
        isActive: false
      }
    )

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

  sendOtp: async (email: string) => {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Email is wrong')
    }

    const otp = Math.floor(100000 + Math.random() * 900000)

    await emailService.sendEmail({
      from: 'Tranhunghp22112004@gmail.com',
      to: user.email as string,
      subject: 'Forgot password',
      text: `Your otp is ${otp}`
      // template: 'otp',
      // context: { otp: otp }
    })

    await ForgotPassword.create({
      otp,
      userId: user.id,
      expired: new Date(Date.now() + 30 * 1000)
    })

    return otp
  },

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
