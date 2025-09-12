import { IUser } from './models/User'
import { UserInterface } from './types/UserInterface'

declare global {
  namespace Express {
    interface AuthInfo {}
    interface User {}
    interface Request {
      authInfo?: AuthInfo | undefined
      user?: any
    }
  }
}
