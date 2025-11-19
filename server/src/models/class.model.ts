import mongoose, { type Document, Schema } from "mongoose"

export interface IClass extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  subject: string
  grade?: string // Lớp/Ngành (VD: "12A1", "IT", "MME", etc.) - có thể để trống
  description?: string
  teacherId: mongoose.Types.ObjectId
  students: mongoose.Types.ObjectId[]
  schedule: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
  maxStudents: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  code: string
  description?: string
  credits: number
  department: string
  teacherId?: mongoose.Types.ObjectId
  prerequisites: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      maxlength: [100, "Class name cannot exceed 100 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [50, "Grade/Major cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },
    students: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: []
    },
    schedule: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"],
        },
      },
    ],
    maxStudents: {
      type: Number,
      required: [true, "Maximum students limit is required"],
      min: [1, "Maximum students must be at least 1"],
      max: [100, "Maximum students cannot exceed 100"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: [100, "Subject name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Subject code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
      max: [10, "Credits cannot exceed 10"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual properties
ClassSchema.virtual("enrolledCount").get(function () {
  return (this.students?.length || 0)
})

ClassSchema.virtual("availableSpots").get(function () {
  const current = (this.students?.length || 0)
  return this.maxStudents - current
})

// Virtual for frontend compatibility (studentIds)
ClassSchema.virtual("studentIds").get(function () {
  return this.students || []
})

// Transform to JSON - rename students to studentIds for frontend
ClassSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.studentIds = ret.students || []
    delete ret.students
    return ret
  }
})

// Indexes
ClassSchema.index({ teacherId: 1, isActive: 1 })
ClassSchema.index({ subject: 1, isActive: 1 })
ClassSchema.index({ "schedule.dayOfWeek": 1 })

SubjectSchema.index({ department: 1, isActive: 1 })

export const Class = mongoose.model<IClass>("Class", ClassSchema)
export const Subject = mongoose.model<ISubject>("Subject", SubjectSchema)
