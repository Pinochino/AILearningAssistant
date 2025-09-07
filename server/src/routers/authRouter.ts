import { Router } from 'express'
import authController from '~/controllers/AuthController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/refresh-token', authController.refreshToken)
authRouter.post('/logout', authController.logout)
authRouter.post('/send-otp', authController.sendOtpCode)
authRouter.post('/forgot-password', authController.forgotPassword)
authRouter.post('/update-password', authController.forgotPassword)

export default authRouter
