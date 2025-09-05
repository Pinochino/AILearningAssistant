import { model, Schema } from 'mongoose'

export enum ValidatedTokenStatus {
  VALID = 'VALID',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIED'
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
      type: Schema.Types.ObjectId
    },
    status: {
      type: Schema.Types.String,
      enum: ValidatedTokenStatus
    }
  },
  {
    timestamps: true
  }
)

export const ValidatedToken = model('ValidatedToken', validatedTokenSchema)
