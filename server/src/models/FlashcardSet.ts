import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IFlashcardItem {
    front: string
    back: string
    difficulty?: 'easy' | 'medium' | 'hard'
    nextReview?: Date
    intervalDays?: number
    easeFactor?: number
    reviewCount?: number
}

export interface IFlashcardSet extends SoftDeleteDocument {
    title: string
    description?: string
    classId: Types.ObjectId
    chapters: Types.ObjectId[]
    createdBy?: Types.ObjectId
    isAIGenerated: boolean
    difficulty?: 'easy' | 'medium' | 'hard'
    flashcards: IFlashcardItem[]
    totalCards: number
}

const flashcardItemSchema = new Schema<IFlashcardItem>(
    {
        front: { type: String, required: true, trim: true },
        back: { type: String, required: true, trim: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
        nextReview: { type: Date },
        intervalDays: { type: Number, default: 0 },
        easeFactor: { type: Number, default: 2.5 },
        reviewCount: { type: Number, default: 0 }
    },
    { _id: true }
)

const flashcardSetSchema = new Schema<IFlashcardSet>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
        chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter', index: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        isAIGenerated: { type: Boolean, default: false },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
        flashcards: [flashcardItemSchema],
        totalCards: { type: Number, default: 0 }
    },
    { timestamps: true }
)

// Index for performance
flashcardSetSchema.index({ classId: 1, chapters: 1 })
flashcardSetSchema.index({ createdBy: 1 })

flashcardSetSchema.pre('save', function (next) {
    this.totalCards = this.flashcards.length
    next()
})

flashcardSetSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    deletedAt: true,
    overrideMethods: 'all'
})

export const FlashcardSet = model<IFlashcardSet, SoftDeleteModel<IFlashcardSet>>('FlashcardSet', flashcardSetSchema)
