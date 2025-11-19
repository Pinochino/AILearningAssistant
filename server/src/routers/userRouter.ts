import { Router } from 'express'
import userController from '~/controllers/UserController.js'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware.js'
import authorizationMiddleware from '~/middlewares/auth/authorizationMiddleware.js'

const userRouter = Router()
userRouter.get('/list', authenticationMiddleware, authorizationMiddleware, userController.getAllUsers)
userRouter.get('/detail/:userId', authenticationMiddleware, userController.getUser)
userRouter.get('/deleted-list', authenticationMiddleware, userController.findDeletedUsers)
userRouter.get('/count-by-role/:roleName', authenticationMiddleware, userController.countUserByRole)
userRouter.post('/list-user/:roleId', authenticationMiddleware, userController.filterUserByRoleId)
userRouter.post('/count-by-active', authenticationMiddleware, userController.countUsesByActive)
userRouter.post('/restore/:userId', authenticationMiddleware, userController.restoreUser)
userRouter.put('/update/:userId', authenticationMiddleware, userController.updateUser)
userRouter.delete('/delete/:userId', authenticationMiddleware, authorizationMiddleware, userController.deleteOne)
userRouter.delete('/delete-all', authenticationMiddleware, authorizationMiddleware, userController.deleteMany)
userRouter.delete('/soft-delete/:userId', authenticationMiddleware, userController.softDelete)

export default userRouter
