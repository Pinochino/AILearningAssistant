import { Router } from 'express'
import authService from '../services/authService.js'
import authController from '~/controllers/AuthController.js'

const authRouter = Router()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
// authRouter.post('/refresh', authController.refreshToken)
// authRouter.post('/logout', authService.authenticate)

export default authRouter
