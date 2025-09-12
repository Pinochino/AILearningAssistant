import { Router } from 'express'
import userController from '~/controllers/UserController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '~/middlewares/auth/authorizationMiddleware'

const userRouter = Router()
userRouter.get('/list', authenticationMiddleware, authorizationMiddleware, userController.getAllUsers)
userRouter.get('/detail/:userId', authenticationMiddleware, userController.getUser)
userRouter.delete('/delete/:userId', authenticationMiddleware, authorizationMiddleware, userController.deleteOne)
userRouter.delete('/delete-all', authenticationMiddleware, authorizationMiddleware, userController.deleteMany)
userRouter.put('/update', authenticationMiddleware, userController.updateUser)

export default userRouter
