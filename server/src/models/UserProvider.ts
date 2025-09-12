import { Document, model, Schema, Types } from 'mongoose'

export enum UserProviderType {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

interface IUserProvider extends Document {
  userId: Types.ObjectId
  provider: UserProviderType
  providerId: string
}

const userProviderSchema = new Schema<IUserProvider>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  provider: {
    type: Schema.Types.String,
    enum: UserProviderType
  },
  providerId: {
    type: Schema.Types.String
  }
})

export const UserProvider = model('UserProvider', userProviderSchema)
