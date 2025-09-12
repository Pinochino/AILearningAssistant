import mongoose, { Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ForgotPasswordInterface extends SoftDeleteDocument {
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

forgotPasswordSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const ForgotPassword = mongoose.model<ForgotPasswordInterface, SoftDeleteModel<ForgotPasswordInterface>>(
  'ForgotPassword',
  forgotPasswordSchema
)
