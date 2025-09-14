import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ISubject extends SoftDeleteDocument {
  name: string
  description?: string
  topics: Types.ObjectId[]
  resources: Types.ObjectId[]
  notes: Types.ObjectId[]
  quizzes: Types.ObjectId[]
  schedules: Types.ObjectId[]
  notifications: Types.ObjectId[]
  studyProgress: Types.ObjectId[]
  userId: Types.ObjectId
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: Schema.Types.String,
      required: [true, `Subject's name is required`],
      unique: [true, `Subject's name is unique`],
      trim: true
    },
    description: {
      type: Schema.Types.String
    },
    topics: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      }
    ],
    resources: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Resource'
      }
    ],
    notes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note'
      }
    ],
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Quizz'
      }
    ],
    schedules: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
      }
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification'
      }
    ],
    studyProgress: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StudyProgress'
      }
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

subjectSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all',
  deletedAt: true
})

export const Subject = model<ISubject, SoftDeleteModel<ISubject>>('Subject', subjectSchema)
