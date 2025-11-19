import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IQuizAnswer {
  questionIndex: number
  selectedAnswer: number
  isCorrect: boolean
  correctAnswer: number
}

export interface IQuizAttempt extends SoftDeleteDocument {
  userId: Types.ObjectId
  quizId: Types.ObjectId
  classId: Types.ObjectId
  answers: IQuizAnswer[]
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpentMinutes: number
  startedAt: Date
  completedAt: Date
}

const answerSchema = new Schema<IQuizAnswer>(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    correctAnswer: { type: Number, required: true }
  },
  { _id: false }
)

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeSpentMinutes: { type: Number, required: true, min: 0 },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true }
  },
  { timestamps: true }
)

// Index cho query hiệu quả
quizAttemptSchema.index({ userId: 1, quizId: 1, completedAt: -1 })
quizAttemptSchema.index({ classId: 1, completedAt: -1 })

quizAttemptSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  deletedAt: true,
  overrideMethods: 'all'
})

export const QuizAttempt = model<IQuizAttempt, SoftDeleteModel<IQuizAttempt>>('QuizAttempt', quizAttemptSchema)