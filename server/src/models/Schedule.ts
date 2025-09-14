import { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum ScheduleRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

interface ISchedule extends SoftDeleteDocument {
  startTime: Date
  endTime: Date
  recurrence: ScheduleRecurrence
  notificationEnabled: boolean
  notifications: Types.ObjectId[]
  subjectId: Types.ObjectId
  userId: Types.ObjectId
}

const scheduleSchema = new Schema<ISchedule>({
  startTime: {
    type: Schema.Types.Date
  },
  endTime: {
    type: Schema.Types.Date
  },
  recurrence: {
    type: Schema.Types.String,
    enum: ScheduleRecurrence,
    default: ScheduleRecurrence.NONE
  },
  notificationEnabled: {
    type: Schema.Types.Boolean,
    default: false
  },
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ],
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

scheduleSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const Schedule = model<ISchedule, SoftDeleteModel<ISchedule>>('Schedule', scheduleSchema)
