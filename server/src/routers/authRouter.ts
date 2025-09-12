import { Request, Router, Response } from 'express'
import passport from 'passport'
import authController from '~/controllers/AuthController'
import { generateAccessToken } from '~/utils/JwtUtils'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/refresh-token', authController.refreshToken)
authRouter.post('/logout', authController.logout)
authRouter.post('/send-otp', authController.sendOtpCode)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/update-password', authController.forgotPassword)
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
  function (req: Request, res: Response) {
    const accessToken = generateAccessToken(req.user)
    res.redirect(`http://localhost:3000/auth/callback?token=${accessToken}`)
    return
  }
)

export default authRouter
