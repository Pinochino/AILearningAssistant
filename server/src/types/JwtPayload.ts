import { Types } from 'mongoose'

export interface JwtPayloadInterface {
  id: Types.ObjectId
  username?: string
  email?: string
  roles: string[]
}
