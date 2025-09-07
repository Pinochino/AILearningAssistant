import { model, Schema } from 'mongoose'

export enum ValidatedTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

const validatedTokenSchema = new Schema(
  {
    token: {
      type: Schema.Types.String
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedAt: {
      type: Schema.Types.Date
    },
    expiredAt: {
      type: Schema.Types.Date
    },
    status: {
      type: Schema.Types.String,
      enum: ValidatedTokenStatus,
      default: ValidatedTokenStatus.ACTIVE
    }
  },
  {
    timestamps: true
  }
)

export const ValidatedToken = model('ValidatedToken', validatedTokenSchema)
