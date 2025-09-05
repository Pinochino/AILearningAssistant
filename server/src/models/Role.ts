import { model, Schema } from 'mongoose'

export enum RoleName {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

const roleSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      enum: RoleName,
      default: RoleName.USER
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
)

export const Role = model('Role', roleSchema)
