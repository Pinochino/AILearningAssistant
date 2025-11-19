import { Schema, model, Types } from "mongoose";

const ConversationSchema = new Schema({
    name: { type: String, default: null }, // group name
    isGroup: { type: Boolean, default: false },
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: Types.ObjectId, ref: "User" }], // for group
    lastMessage: { type: Types.ObjectId, ref: "Message", default: null },
    aiTutorId: { type: String, default: null }, // e.g., "math-tutor", "science-tutor"
    // Conversation type for better organization
    conversationType: {
        type: String,
        enum: ["direct", "group", "ai"],
        default: "direct"
    },
    // Derived keys to avoid duplicates
    participantKey: { type: String, default: null }, // for direct
    aiKey: { type: String, default: null }, // for ai
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ conversationType: 1 });

// Enforce uniqueness for direct conversations between the same 2 users
ConversationSchema.index(
  { participantKey: 1 },
  { unique: true, partialFilterExpression: { conversationType: 'direct', isGroup: false, participantKey: { $type: 'string' } } as any }
);

// Enforce uniqueness for AI conversation per user+tutor
ConversationSchema.index(
  { aiKey: 1 },
  { unique: true, partialFilterExpression: { conversationType: 'ai', aiKey: { $type: 'string' } } as any }
);

// Compute derived keys
ConversationSchema.pre('validate', function (next) {
  try {
    const doc: any = this as any;
    const type = String(doc.conversationType || 'direct');
    if (type === 'direct' && Array.isArray(doc.participants) && doc.participants.length === 2) {
      const ids = doc.participants.map((p: any) => String(p)).sort();
      doc.participantKey = ids.join('|');
    } else {
      doc.participantKey = null;
    }

    if (type === 'ai' && Array.isArray(doc.participants) && doc.participants.length >= 1 && doc.aiTutorId) {
      const userId = String(doc.participants[0]);
      doc.aiKey = `${userId}|${doc.aiTutorId}`;
    } else {
      doc.aiKey = null;
    }
    next();
  } catch (e) {
    next(e as any);
  }
});

export const Conversation = model("Conversation", ConversationSchema);
