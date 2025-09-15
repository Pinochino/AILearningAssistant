import { Application } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import fileRouter from './fileRouter.js'
import emailRouter from './emailRouter.js'
import noteRouter from './noteRouter.js'
import subjectRouter from './subjectRouter.js'
import resourceRouter from './resourceRouter.js'

const routers = (app: Application) => {
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/files', fileRouter)
  app.use('/api/email', emailRouter)
  app.use('/api/notes', noteRouter)
  app.use('/api/subjects', subjectRouter)
  app.use('/api/resources', resourceRouter)
}

export default routers
