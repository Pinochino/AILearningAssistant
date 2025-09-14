import { UserProviderType } from '~/models/UserProvider'

export interface UserInterface {
  id: string
  username?: string
  email: string
  password?: string
  roles?: string
}

export type LoginType = Pick<UserInterface, 'email' | 'password'>
export type RegisterType = Required<UserInterface>
