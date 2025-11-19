import { UserInterface } from './UserInterface.js'

export interface TokenResponse {
  user: UserInterface
  accessToken: string
  refreshToken: string
}
