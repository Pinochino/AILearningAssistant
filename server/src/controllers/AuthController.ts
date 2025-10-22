import { Response, Request } from 'express'
import authService from '~/services/authService'
import { responseUtils } from '~/utils/ResponseUtils'

const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body

      const user = await authService.authenticate({ email, password })
      res.cookie('REFRESH_TOKEN', user.refreshToken, {
        sameSite: 'strict',
        httpOnly: false,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
      })
      responseUtils({ req, res, code: 200, message: `Login successfully`, data: user })
    } catch (error: any) {
      responseUtils({ req, res, code: 401, message: error.message })
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      console.log(req.body)
      const user = await authService.createUser(req.body)
      // res.cookie('REFRESH_TOKEN', user?.refreshToken, {
      //   maxAge: 60 * 1000,
      //   sameSite: 'strict',
      //   httpOnly: false,
      //   expires: new Date(Date.now() * 60 * 60 * 1000)
      // })
      responseUtils({ req, res, code: 200, message: `Register successfully`, data: user })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies['REFRESH_TOKEN']
      const accessToken = await authService.refreshToken(refreshToken)
      responseUtils({ req, res, code: 200, data: accessToken })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies['REFRESH_TOKEN']

      console.log(refreshToken)
      await authService.logout(refreshToken)
      res.clearCookie('REFRESH_TOKEN')
      responseUtils({ req, res, code: 200, message: 'Logout successfully' })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  sendOtpCode: async (req: Request, res: Response) => {
    try {
      const { email } = req.body
      const otp = await authService.sendOtp(email)
      responseUtils({ req, res, code: 200, message: `Send otp successfully`, data: otp })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { otp, email, password: newPassword } = req.body
      await authService.forgotPassword(otp, email, newPassword)
      responseUtils({ req, res, code: 200, message: `Forgot password successfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  updatePassord: async (req: Request, res: Response) => {
    try {
      const { id: userId } = req.user as any
      const { password: newPassword } = req.body
      await authService.updatePassword(userId, newPassword)
      responseUtils({ req, res, code: 200, message: `Update password successfully` })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    try {
      const { otp, email } = req.body
      const result = await authService.verifyOtp(otp, email)
      responseUtils({ req, res, code: 200, message: 'Verify otp successfully', data: result })
    } catch (error: any) {
      responseUtils({ req, res, code: 400, message: error.message })
    }
  }
}
export default authController
