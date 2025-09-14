import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum StudyProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  NEW_REVIEW = 'NEW_REVIEW'
}

interface IStudyProgress extends SoftDeleteDocument {
  studyStatus: StudyProgressStatus
  last_review_at: Date
  ai_recommendation: object
}

const studyProgressSchema = new Schema<IStudyProgress>(
  {
    studyStatus: {
      type: Schema.Types.String,
      enum: StudyProgressStatus
    },
    last_review_at: {
      type: Schema.Types.Date
    },
    ai_recommendation: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
)

studyProgressSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: 'all',
  deletedByType: String
})

export const StudyProgress = model<IStudyProgress, SoftDeleteModel<IStudyProgress>>(
  'StudyProgress',
  studyProgressSchema
)
