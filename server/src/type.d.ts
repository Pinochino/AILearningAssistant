declare global {
  namespace Express {
    interface User {
      id: string
      role: string
      firstName: string
      lastName: string
    }
  }
}
