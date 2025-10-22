import { Types } from 'mongoose'

export interface JwtPayloadInterface {
  id: Types.ObjectId
  name?: string
  username?: string
  email?: string
  roles: string[]
}
