import { Router } from 'express'
import roleController from '~/controllers/RoleController'

const roleRouter = Router()
roleRouter.get('/list', roleController.getRoles)

export default roleRouter
