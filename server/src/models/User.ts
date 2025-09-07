import { Document, model, Schema } from 'mongoose'
import { hashedText } from '~/utils/BcryptUtils'


const userSchema = new Schema(
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
    role: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role'
      }
    ],
    forgotPassword: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ForgotPassword',
      }
    ],
    validatedToken: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ValidatedToken'
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
