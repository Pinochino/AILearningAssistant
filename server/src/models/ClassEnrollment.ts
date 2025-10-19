import mongoose, { type Document, Schema } from "mongoose"

export interface IClassEnrollment extends Document {
  _id: mongoose.Types.ObjectId
  classId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ClassEnrollmentSchema = new Schema<IClassEnrollment>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
ClassEnrollmentSchema.index({ classId: 1, studentId: 1 })
ClassEnrollmentSchema.index({ studentId: 1, status: 1 })
ClassEnrollmentSchema.index({ classId: 1, status: 1 })
ClassEnrollmentSchema.index({ status: 1, requestedAt: -1 })

// Compound index to prevent duplicate pending requests
ClassEnrollmentSchema.index(
  { classId: 1, studentId: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' },
    name: 'unique_pending_enrollment'
  }
)

export const ClassEnrollment = mongoose.model<IClassEnrollment>("ClassEnrollment", ClassEnrollmentSchema)
