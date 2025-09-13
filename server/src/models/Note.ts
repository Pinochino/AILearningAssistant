import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

interface INote extends SoftDeleteDocument {
  content: string
}

const noteSchema = new Schema<INote>({
  content: {
    type: Schema.Types.String
  }
})

noteSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const Note = model<INote>('Note', noteSchema)
