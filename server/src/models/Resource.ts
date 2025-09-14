import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum ResourceType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  PPTX = 'PPTX',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER'
}

interface IResource extends SoftDeleteDocument {
  title: string
  description?: string
  resourceType: ResourceType
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
      type: Schema.Types.String,
      enum: ResourceType
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
