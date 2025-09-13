import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface ISubject extends SoftDeleteDocument {
  name: string
  description?: string
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: Schema.Types.String,
      required: [true, `Subject's name is required`]
    },
    description: {
      type: Schema.Types.String
    }
  },
  {
    timestamps: true
  }
)

subjectSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all',
  deletedAt: true
})

export const Subject = model<ISubject, SoftDeleteModel<ISubject>>('Subject', subjectSchema)
