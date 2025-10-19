import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  scope: 'school' | 'class';
  classId?: Types.ObjectId | null;
  author: Types.ObjectId;
  pinned?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    scope: { type: String, enum: ['school', 'class'], default: 'school', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pinned: { type: Boolean, default: false, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
