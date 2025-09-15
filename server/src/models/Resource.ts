import { model, Schema, Types } from 'mongoose'
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
  userId: Types.ObjectId
  subjectId: Types.ObjectId
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
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject'
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
