import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

interface INote extends SoftDeleteDocument {
  title: string
  content: string
  userId: Types.ObjectId
  subjectId: Types.ObjectId
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: Schema.Types.String
    },
    content: {
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

noteSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const Note = model<INote>('Note', noteSchema)
