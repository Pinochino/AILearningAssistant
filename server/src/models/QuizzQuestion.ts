import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum QuizzQuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE'
}

interface IQuizzQuestion extends SoftDeleteDocument {
  quizzType: QuizzQuestionType
  questionText: string
  correctAnswer: Array<string>
}

const quizzQuestionSchema = new Schema<IQuizzQuestion>(
  {
    quizzType: {
      type: Schema.Types.String,
      enum: QuizzQuestionType
    },
    questionText: {
      type: Schema.Types.String
    },
    correctAnswer: [
      {
        type: Schema.Types.String
      }
    ]
  },
  { timestamps: true }
)

quizzQuestionSchema.plugin(MongooseDelete, {
  overrideMethods: true,
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

export const QuizzQuestion = model<IQuizzQuestion, SoftDeleteModel<IQuizzQuestion>>(
  'QuizzQuestion',
  quizzQuestionSchema
)
