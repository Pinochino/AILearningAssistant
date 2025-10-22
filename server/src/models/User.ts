import { model, Query, Schema, Types } from 'mongoose'
import { hashedText } from '~/utils/BcryptUtils'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IUser extends SoftDeleteDocument {
  name: string
  username: string
  email?: string
  password: string
  avatar?: string
  roles?: Types.ObjectId[]
  provider?: Types.ObjectId[]
  forgotPassword?: Types.ObjectId[]
  validatedToken?: Types.ObjectId[]
  subjects?: Types.ObjectId[]
  notes?: Types.ObjectId[]
  schedules?: Types.ObjectId[]
  notifications?: Types.ObjectId[]
  studyProgress?: Types.ObjectId[]
  resources?: Types.ObjectId[]
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: Schema.Types.String,
      required: [true, 'Name is required'],
      trim: true
    },
    username: {
      type: Schema.Types.String,
      required: [true, 'Username is required'],
      trim: true
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      required: false,
      sparse: true,
      index: true,
      trim: true
    },
    password: {
      type: Schema.Types.String,
      required: [true, 'Password is required'],
      min: [6, 'Password has at least 3 character']
    },
    avatar: {
      type: Schema.Types.String
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role'
      }
    ],
    forgotPassword: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ForgotPassword'
      }
    ],
    validatedToken: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ValidatedToken'
      }
    ],
    provider: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserProvider'
      }
    ],
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ],
    notes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note'
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
    resources: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Resource'
      }
    ]
  },
  {
    timestamps: true
  }
)

userSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String, deletedAt: true, overrideMethods: 'all' })

userSchema.pre<IUser>('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await hashedText(this.password as string)
    }
    next()
  } catch (err: any) {
    next(err)
  }
})

userSchema.pre<Query<any, IUser>>('updateOne', async function (next) {
  try {
    const update = this.getUpdate() as any
    if (update.password && typeof update.password === 'string') {
      update.password = await hashedText(update.password)
      this.setUpdate(update)
    }
    next()
  } catch (err: any) {
    next(err)
  }
})

export const User = model<IUser, SoftDeleteModel<IUser>>('User', userSchema)
