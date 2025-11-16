import { Router } from 'express'
import roleController from '~/controllers/RoleController.js'

const roleRouter = Router()
roleRouter.get('/list', roleController.getRoles)

export default roleRouter
