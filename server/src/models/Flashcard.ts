import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IFlashcard extends SoftDeleteDocument {
  front: string
  back: string
  chapters?: Types.ObjectId[]
  classId: Types.ObjectId
  createdBy?: Types.ObjectId
  isAIGenerated: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
  nextReview?: Date
  intervalDays?: number
  easeFactor?: number
  reviewCount?: number
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter', index: true }],
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isAIGenerated: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    nextReview: { type: Date, index: true },
    intervalDays: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

// Index gợi ý dùng nhiều
flashcardSchema.index({ classId: 1, chapter: 1, nextReview: 1 })

flashcardSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  deletedAt: true,
  overrideMethods: 'all'
})

export const Flashcard = model<IFlashcard, SoftDeleteModel<IFlashcard>>('Flashcard', flashcardSchema)
