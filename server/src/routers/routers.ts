import { Application } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import fileRouter from './fileRouter.js'
import emailRouter from './emailRouter.js'
import xlsxRouter from './xlsxRouter.js'
import roleRouter from './roleRouter.js'

const routers = (app: Application) => {
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/files', fileRouter)
  app.use('/api/email', emailRouter)
  app.use('/api/excel', xlsxRouter)
  app.use('/api/roles', roleRouter)
}

export default routers
