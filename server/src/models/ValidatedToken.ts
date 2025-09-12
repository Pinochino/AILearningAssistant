import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum ValidatedTokenStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface IValidatedToken extends SoftDeleteDocument {
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

validatedTokenSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const ValidatedToken = model<IValidatedToken, SoftDeleteModel<IValidatedToken>>(
  'ValidatedToken',
  validatedTokenSchema
)
