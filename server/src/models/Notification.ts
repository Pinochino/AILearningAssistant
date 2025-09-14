import { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export enum NotificationType {
  REMINDER = 'REMINDER',
  NEW_LESSION = 'NEW_LESSION',
  QUIZ_READY = 'QUIZ_READY',
  PROGRESS_ALERT = 'PROGRESS_ALERT',
  SYSTEM = 'SYSTEM'
}

interface INotification extends SoftDeleteDocument {
  notificationType: NotificationType
  message: string
  sendAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    notificationType: {
      type: Schema.Types.String,
      enum: NotificationType
    },
    message: {
      type: Schema.Types.String
    },
    sendAt: {
      type: Schema.Types.Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

notificationSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

export const Notification = model<INotification, SoftDeleteModel<INotification>>('Notification', notificationSchema)
