declare global {
  namespace Express {
    interface AuthInfo {}
    interface User {}
    interface Request {
      authInfo?: AuthInfo | undefined;
      user?: any;
    }
  }
}

