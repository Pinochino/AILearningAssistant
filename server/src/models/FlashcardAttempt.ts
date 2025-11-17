import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcardAttempt extends Document {
    userId: mongoose.Types.ObjectId;
    flashcardSetId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    cards: {
        cardIndex: number;
        isCorrect: boolean;
        timeSpentSeconds?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
    }[];
    score: number; // percentage 0-100
    totalCards: number;
    correctCards: number;
    incorrectCards: number;
    timeSpentMinutes: number;
    startedAt: Date;
    completedAt: Date;
    sessionId: string;
}

const FlashcardAttemptSchema = new Schema<IFlashcardAttempt>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    flashcardSetId: {
        type: Schema.Types.ObjectId,
        ref: 'FlashcardSet',
        required: true,
        index: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
        index: true
    },
    cards: [{
        cardIndex: {
            type: Number,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
        timeSpentSeconds: {
            type: Number,
            default: 0
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }],
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalCards: {
        type: Number,
        required: true,
        min: 0
    },
    correctCards: {
        type: Number,
        required: true,
        min: 0
    },
    incorrectCards: {
        type: Number,
        required: true,
        min: 0
    },
    timeSpentMinutes: {
        type: Number,
        required: true,
        min: 0
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    completedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
FlashcardAttemptSchema.index({ userId: 1, flashcardSetId: 1 });
FlashcardAttemptSchema.index({ userId: 1, flashcardSetId: 1, completedAt: -1 });
FlashcardAttemptSchema.index({ classId: 1, completedAt: -1 });

export const FlashcardAttempt = mongoose.model<IFlashcardAttempt>('FlashcardAttempt', FlashcardAttemptSchema);
