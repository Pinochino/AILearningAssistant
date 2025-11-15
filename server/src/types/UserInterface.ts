import { UserProviderType } from '~/models/UserProvider'

export interface UserInterface {
  id: string
  name: string
  username?: string
  password?: string
  roles?: string
}

export type LoginType = Pick<UserInterface, 'username' | 'password'>
export type RegisterType = Required<UserInterface>

export interface EditUserInterface {
  name: string
  username: string
  password: string
  roles?: string
  addRoleId?: string
  removeRoleId?: string
}
