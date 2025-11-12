import { Application } from 'express'
import authRouter from './authRouter'
import userRouter from './userRouter'
import fileRouter from './fileRouter'
import emailRouter from './emailRouter'
import xlsxRouter from './xlsxRouter'
import roleRouter from './roleRouter'
import classRouter from '../routes/class.routes'

const routers = (app: Application) => {
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/files', fileRouter)
  app.use('/api/email', emailRouter)
  app.use('/api/excel', xlsxRouter)
  app.use('/api/roles', roleRouter)
  app.use('/api', classRouter)
}

export default routers
