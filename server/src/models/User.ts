import { Document, model, Schema, Types } from 'mongoose'
import { hashedText } from '~/utils/BcryptUtils'

export interface IUser extends Document {
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

userSchema.pre('save', async function (next) {
  try {
    const hashedhPassword = await hashedText(this.password as string)
    this.password = hashedhPassword
  } catch (err: any) {
    next(err)
  }
})

export const User = model('User', userSchema)
