import { Response } from 'express'
import authService from '~/services/authService'

const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body

      console.log(email)
      const user = await authService.authenticate(req.body)
      res.cookie('REFRESH_TOKEN', user.refreshToken, {
        maxAge: 900000,
        sameSite: 'strict',
        httpOnly: true,
        expires: new Date(Date.now() * 60 * 60 * 1000)
      })

      res.status(200).json({ msg: 'Login successfully', data: user })
      return
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const user = await authService.createUser(req.body)
      res.status(200).json({ msg: 'Register successfully', data: user })
      return
    } catch (error: any) {
      res.status(500).json({ error: error.message })
      return
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    const { id: userId } = req?.user
    const { token: refreshToken } = req.body
    const accessToken = await authService.refreshToken(userId, refreshToken)
    res.status(200).json(accessToken)
    return
  },

  logout: async (req: Request, res: Response) => {
    const { id: userId } = req?.user
    const { token: refreshToken } = req.body
    await authService.logout(userId, refreshToken)
    res.clearCookie('REFRESH_TOKEN')
    res.status(200).json({
      message: 'Logout successfully'
    })
    return
  }
}
export default authController
