import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export type MaterialType = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'video' | 'audio' | 'txt' | 'other'

export interface IMaterial extends SoftDeleteDocument {
  title: string
  description?: string

  classId: Types.ObjectId
  chapter: Types.ObjectId
  uploadedBy: Types.ObjectId

  fileName: string
  fileUrl: string            // URL truy cập (local path hoặc S3/Cloud)
  mimeType: string
  size: number               // bytes
  type: MaterialType

  pageCount?: number         // nếu PDF
  durationSec?: number       // nếu media
  checksum?: string          // md5/sha256 (nếu có)

  isAIGenerated?: boolean
}

const materialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['pdf', 'docx', 'pptx', 'xlsx', 'image', 'video', 'audio', 'txt', 'other'],
      required: true
    },

    pageCount: { type: Number, min: 0 },
    durationSec: { type: Number, min: 0 },
    checksum: { type: String, trim: true },

    isAIGenerated: { type: Boolean, default: false }
  },
  { timestamps: true }
)

materialSchema.index({ classId: 1, chapter: 1, createdAt: -1 })

materialSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  deletedAt: true,
  overrideMethods: 'all'
})

export const Material = model<IMaterial, SoftDeleteModel<IMaterial>>('Material', materialSchema)
