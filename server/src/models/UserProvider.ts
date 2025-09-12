import { Document, model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum UserProviderType {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK'
}

interface IUserProvider extends SoftDeleteDocument {
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

userProviderSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const UserProvider = model<IUserProvider, SoftDeleteModel<IUserProvider>>('UserProvider', userProviderSchema)
