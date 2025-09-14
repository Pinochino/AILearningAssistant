import mongoose, { model, Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface ITopic extends SoftDeleteDocument {
  title: string
  orderIndex: Types.ObjectId
  studyProgress: Types.ObjectId[]
}

const topicSchema = new Schema<ITopic>(
  {
    title: {
      type: Schema.Types.String
    },
    orderIndex: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    studyProgress: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StudyProgress'
      }
    ]
  },
  {
    timestamps: true
  }
)

topicSchema.plugin(MongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: 'all', deletedByType: String })

export const Topic = model<ITopic, SoftDeleteModel<ITopic>>('Topic', topicSchema)
