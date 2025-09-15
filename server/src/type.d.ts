declare global {
  namespace Express {
    interface Request {
      authInfo?: AuthInfo | undefined
      user?: any
    }
  }
}
