import { Request, Router, Response } from 'express'
import passport from 'passport'
import authController from '~/controllers/AuthController'
import { ValidatedToken } from '~/models/ValidatedToken'
import { generateAccessToken } from '~/utils/JwtUtils'
import crypto from 'crypto'
import { User } from '~/models/User'
import { Role, RoleName } from '~/models/Role'
import { Types } from 'mongoose'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/refresh-token', authController.refreshToken)
authRouter.post('/logout', authController.logout)
// authRouter.post('/send-otp', authController.sendOtpCode)
authRouter.post('/verify-otp', authController.verifyOtp)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/update-password', authController.updatePassord)
authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false
  })
)
authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/google/failure'
  }),
  async function (req: Request, res: Response) {
    const user = req.user

    const accessToken = generateAccessToken(user)
    const refreshToken = crypto.randomBytes(32).toString('hex')

    await ValidatedToken.create({
      token: refreshToken,
      userId: (user as any)?._id,
      issuedAt: Date.now(),
      expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    res.cookie('REFRESH_TOKEN', refreshToken, {
      maxAge: 60 * 1000,
      sameSite: 'strict',
      httpOnly: false,
      expires: new Date(Date.now() * 60 * 60 * 1000)
    })

    res.redirect(`http://localhost:5173/auth/callback?token=${accessToken}`)
    return
  }
)

export default authRouter
