import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface IQuizz extends SoftDeleteDocument {
  title: string
  quizQuestions: Types.ObjectId[]
  quizResults: Types.ObjectId[]
  userId: Types.ObjectId
  subjectId: Types.ObjectId
}

const quizzSchema = new Schema<IQuizz>(
  {
    title: {
      type: Schema.Types.String
    },
    quizQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'QuizzQuestion'
      }
    ],
    quizResults: [
      {
        type: Schema.Types.ObjectId,
        ref: 'QuizzResult'
      }
    ],
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

quizzSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

export const Quizz = model<IQuizz, SoftDeleteModel<IQuizz>>('Quizz', quizzSchema)
