import { Schema, model, Types } from "mongoose";

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"],
        required: true
    },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    // For students
    studentId: { type: String, sparse: true },
    classId: { type: Types.ObjectId, ref: "Class", default: null },
    // For teachers
    teacherId: { type: String, sparse: true },
    subjects: [{ type: Types.ObjectId, ref: "Subject" }],
    // For admins
    permissions: [{ type: String }],
}, { timestamps: true });

UserSchema.index({ role: 1 });
UserSchema.index({ classId: 1 });

export const User = model("User", UserSchema);
