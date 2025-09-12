import { model, Schema, Types } from 'mongoose'

export enum ValidatedTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface IValidatedToken extends Document {
  token: string
  userId: Types.ObjectId
  issuedAt: Date
  expiredAt: Date
  status: ValidatedTokenStatus
}

const validatedTokenSchema = new Schema<IValidatedToken>(
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
