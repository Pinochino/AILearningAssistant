import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ForgotPasswordInterface extends Document {
  otp: string
  userId: Types.ObjectId
  attemps: Schema.Types.Int32
  expiredAt: Date
  isUsed: boolean
}

const forgotPasswordSchema = new Schema<ForgotPasswordInterface>(
  {
    otp: {
      type: Schema.Types.String,
      unique: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    attemps: {
      type: Schema.Types.Int32,
      default: 0
    },
    isUsed: {
      type: Schema.Types.Boolean,
      default: false
    },
    expiredAt: {
      type: Schema.Types.Date
    }
  },
  {
    timestamps: true
  }
)

export const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema)
