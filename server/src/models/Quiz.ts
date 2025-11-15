// AILearningAssistant\server\src\models\Quiz.ts
import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IQuizQuestion {
  question: string
  answers: string[]
  correctAnswer: number
  explanation?: string
  // tương lai: type?: 'mcq' | 'multi' | 'short' | 'fill'
}

export interface IQuiz extends SoftDeleteDocument {
  title: string
  description?: string
  classId: Types.ObjectId           
  chapters: Types.ObjectId[]        
  createdBy?: Types.ObjectId
  durationMinutes?: number
  isPublic: boolean
  isAIGenerated: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
  questions: IQuizQuestion[]
}

const questionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true },
    answers: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 2,
        message: 'Each question must have at least 2 answers.'
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: function (this: IQuizQuestion, v: number) {
          // Không dùng this.answers ở đây vì subdoc context; validate ở cấp quiz bên dưới
          return Number.isInteger(v) && v >= 0
        },
        message: 'correctAnswer must be a non-negative integer.'
      }
    },
    explanation: { type: String, trim: true }
  },
  { _id: false }
)

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    durationMinutes: { type: Number, min: 1 },
    isPublic: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    questions: { type: [questionSchema], default: [] }
  },
  { timestamps: true }
)

// Validator cấp quiz: đảm bảo correctAnswer < answers.length
quizSchema.pre('validate', function (next) {
  const qz = this as unknown as IQuiz
  if (Array.isArray(qz.questions)) {
    for (const q of qz.questions) {
      if (!Array.isArray(q.answers) || q.answers.length < 2) {
        return next(new Error('Each question must have at least 2 answers.'))
      }
      if (
        typeof q.correctAnswer !== 'number' ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.answers.length
      ) {
        return next(new Error('correctAnswer index is out of range for a question.'))
      }
    }
  }
  next()
})

quizSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  deletedAt: true,
  overrideMethods: 'all'
})

quizSchema.index({ classId: 1, 'chapters': 1, createdAt: -1 })

export const Quiz = model<IQuiz, SoftDeleteModel<IQuiz>>('Quiz', quizSchema)
