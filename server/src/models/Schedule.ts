import { model, Schema } from 'mongoose'
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
  }
})

scheduleSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  deletedByType: String,
  overrideMethods: 'all'
})

export const Schedule = model<ISchedule, SoftDeleteModel<ISchedule>>('Schedule', scheduleSchema)
