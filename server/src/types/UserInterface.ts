import { UserProviderType } from '~/models/UserProvider'

export interface UserInterface {
  id: string
  name: string
  username: string
  email?: string
  password?: string
  roles?: string
}

export type LoginType = Pick<UserInterface, 'username' | 'password'>
export type RegisterType = Required<Pick<UserInterface, 'name' | 'username'>> & {
  password: string
  roles: string[]
  email?: string
}
