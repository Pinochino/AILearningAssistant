import { Router } from 'express'
import roleController from '~/controllers/RoleController'

const roleRouter = Router()
roleRouter.get('/list', roleController.getRoles)
roleRouter.post('/list-user/:roleId', roleController.getUserByRole)

export default roleRouter
