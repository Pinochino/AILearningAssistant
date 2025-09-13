import mongoose, { model, Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

interface ITopic extends SoftDeleteDocument {
  title: string
  order_index: number
}

const topicSchema = new Schema<ITopic>(
  {
    title: {
      type: Schema.Types.String
    },
    order_index: {
      type: Schema.Types.Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

topicSchema.plugin(MongooseDelete, { deletedAt: true, deletedBy: true, overrideMethods: 'all', deletedByType: String })

export const Topic = model<ITopic, SoftDeleteModel<ITopic>>('Topic', topicSchema)
