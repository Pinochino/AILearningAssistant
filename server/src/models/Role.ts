import { model, Schema, Types } from 'mongoose'

export enum RoleName {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface IRole extends Document {
  name: RoleName;
  user: Types.ObjectId[];
}

const roleSchema = new Schema<IRole>(
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
