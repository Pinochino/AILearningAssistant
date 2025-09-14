import { UserInterface } from './types/UserInterface'

declare global {
  namespace Express {
    interface Request {
      authInfo?: AuthInfo | undefined
      user?: UserInterface
    }
  }
}
