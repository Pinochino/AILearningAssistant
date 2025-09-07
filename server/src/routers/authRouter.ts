import { Router } from 'express'
import passport from 'passport'
import authController from '~/controllers/AuthController'
// import GoogleStrategy from 'passport-google-oidc';

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/refresh-token', authController.refreshToken)
authRouter.post('/logout', authController.logout)
authRouter.post('/send-otp', authController.sendOtpCode)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/update-password', authController.forgotPassword)
authRouter.get('/login/federated/google', passport.authenticate('google'))

export default authRouter
