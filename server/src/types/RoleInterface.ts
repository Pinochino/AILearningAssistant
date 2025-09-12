import { Document, Mongoose, Types } from 'mongoose'

export interface RoleInterface extends Document {
  name: string
}
