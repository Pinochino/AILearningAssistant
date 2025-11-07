import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IChapter extends SoftDeleteDocument {
  title: string
  order: number
  classId: Types.ObjectId     // 🔹 Thêm dòng này
  documents: Types.ObjectId[]
  quizzes: Types.ObjectId[]
  flashcards: Types.ObjectId[]
}

const chapterSchema = new Schema<IChapter>(
  {
    title: { type: Schema.Types.String, required: true, trim: true },
    order: { type: Schema.Types.Number, default: 0 },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true }, // 🔹 Thêm dòng này
    documents: [{ type: Schema.Types.ObjectId, ref: 'Material' }],
    quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
    flashcards: [{ type: Schema.Types.ObjectId, ref: 'Flashcard' }]
  },
  { timestamps: true }
)

chapterSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String, deletedAt: true, overrideMethods: 'all' })

export const Chapter = model<IChapter, SoftDeleteModel<IChapter>>('Chapter', chapterSchema)
