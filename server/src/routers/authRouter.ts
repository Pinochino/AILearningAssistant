import { Router } from 'express'
import authController from '~/controllers/AuthController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/refresh-token', authenticationMiddleware, authController.refreshToken)
authRouter.post('/logout', authenticationMiddleware, authController.logout)

export default authRouter
