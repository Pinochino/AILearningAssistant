import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface IResource extends SoftDeleteDocument {
  title: string
  description?: string
  resourceType: string
  path: string
}

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: Schema.Types.String
    },
    description: {
      type: Schema.Types.String
    },
    resourceType: {
      type: Schema.Types.String
    },
    path: {
      type: Schema.Types.String
    }
  },
  {
    timestamps: true
  }
)

resourceSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const Resource = model<IResource, SoftDeleteModel<IResource>>('Resource', resourceSchema)
