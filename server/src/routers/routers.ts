import { Application } from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'
import fileRouter from './fileRouter.js'
import emailRouter from './emailRouter.js'

const routers = (app: Application) => {
  app.use('/api/auth', authRouter)
  app.use("/api/users", userRouter)
  app.use("/api/files", fileRouter)
  app.use("/api/email", emailRouter)
  

}

export default routers
