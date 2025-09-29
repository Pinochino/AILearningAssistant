import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum RoleName {
  USER = 'USER',
  TEACHER = 'TEACHER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface IRole extends SoftDeleteDocument {
  name: RoleName
  users: Types.ObjectId[]
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: Schema.Types.String,
      enum: RoleName,
      default: RoleName.USER,
      unique: true
    },
    users: [
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

roleSchema.plugin(MongooseDelete, { deletedAt: true, deletedBy: true, deletedByType: String, overrideMethods: 'all' })

export const Role = model<IRole, SoftDeleteModel<IRole>>('Role', roleSchema)
