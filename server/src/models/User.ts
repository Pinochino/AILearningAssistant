import { model, Query, Schema, Types } from 'mongoose'
import { hashedText } from '~/utils/BcryptUtils'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IUser extends SoftDeleteDocument {
  username: string
  email: string
  password: string
  avatar?: string
  roles?: Types.ObjectId[]
  forgotPassword?: Types.ObjectId[]
  validatedToken?: Types.ObjectId[]
  provider?: Types.ObjectId[]
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: Schema.Types.String
    },
    email: {
      type: Schema.Types.String,
      unique: true
    },
    password: {
      type: Schema.Types.String
    },
    avatar: {
      type: Schema.Types.String
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role'
      }
    ],
    forgotPassword: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ForgotPassword'
      }
    ],
    validatedToken: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ValidatedToken'
      }
    ],
    provider: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserProvider'
      }
    ]
  },
  {
    timestamps: true
  }
)

userSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String, deletedAt: true, overrideMethods: 'all' })

userSchema.pre<IUser>('save', async function (next) {
  try {
    const hashedhPassword = await hashedText(this.password as string)
    this.password = hashedhPassword
  } catch (err: any) {
    next(err)
  }
})

userSchema.pre<Query<any, IUser>>('updateOne', async function (next) {
  try {
    const update = this.getUpdate() as any
    if (update) {
      update.password = await hashedText(update.password)
      this.setUpdate(update)
    }
    next()
  } catch (err: any) {
    next(err)
  }
})

export const User = model<IUser, SoftDeleteModel<IUser>>('User', userSchema)
