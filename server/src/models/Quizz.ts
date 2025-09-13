import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface IQuizz extends SoftDeleteDocument {
  title: string
  createdAt: Date
}

const quizzSchema = new Schema<IQuizz>(
  {
    title: {
      type: Schema.Types.String
    },
    createdAt: {
      type: Schema.Types.Date,
      default: new Date()
    }
  },
  {
    timestamps: true
  }
)

quizzSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

export const Quizz = model<IQuizz, SoftDeleteModel<IQuizz>>('Quizz', quizzSchema)
