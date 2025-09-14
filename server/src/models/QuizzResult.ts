import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface IQuizzResult extends SoftDeleteDocument {
  score: number
  takenAt: Date
  userId: Types.ObjectId
  quizzId: Types.ObjectId
  answer: object
}

const quizzResultSchema = new Schema<IQuizzResult>(
  {
    score: { type: Schema.Types.Number },
    takenAt: { type: Schema.Types.Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    quizzId: { type: Schema.Types.ObjectId, ref: 'Quizz' },
    answer: { type: Schema.Types.Mixed }
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
