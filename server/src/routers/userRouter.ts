import { Router } from 'express'
import userController from '~/controllers/UserController'
import authenticationMiddleware from '~/middlewares/auth/authenticationMiddleware'
import authorizationMiddleware from '~/middlewares/auth/authorizationMiddleware'

const userRouter = Router()
// Public list (no auth) to avoid auth issues in client preloads
userRouter.get('/list', userController.getAllUsers)
// Counts
userRouter.get('/count-by-role/:roleName', userController.countUserByRole)
userRouter.get('/count-by-active', userController.countUserIsActive)
userRouter.get('/detail/:userId', authenticationMiddleware, userController.getUser)
userRouter.get('/deleted-list', authenticationMiddleware, userController.findDeletedUsers)
userRouter.post('/restore/:userId', authenticationMiddleware, userController.restoreUser)
userRouter.put('/update/:userId', authenticationMiddleware, userController.updateUser)
userRouter.delete('/delete/:userId', authenticationMiddleware, authorizationMiddleware, userController.deleteOne)
userRouter.delete('/delete-all', authenticationMiddleware, authorizationMiddleware, userController.deleteMany)
userRouter.delete('/soft-delete/:userId', authenticationMiddleware, userController.softDelete)

export default userRouter
