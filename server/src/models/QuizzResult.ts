import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface IQuizzResult extends SoftDeleteDocument {
  score: number
  takenAt: Date
}

const quizzResultSchema = new Schema<IQuizzResult>(
  {
    score: { type: Schema.Types.Number },
    takenAt: { type: Schema.Types.Date, default: new Date() }
  },
  { timestamps: true }
)

quizzResultSchema.plugin(MongooseDelete, {
  overrideMethods: true,
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

export const QuizzResult = model<IQuizzResult, SoftDeleteModel<IQuizzResult>>('QuizzResult', quizzResultSchema)
