import { Schema, model, Types } from "mongoose";

const ConversationSchema = new Schema({
    name: { type: String, default: null }, // group name
    isGroup: { type: Boolean, default: false },
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: Types.ObjectId, ref: "User" }], // for group
    lastMessage: { type: Types.ObjectId, ref: "Message", default: null },
    // For AI conversations
    isAiConversation: { type: Boolean, default: false },
    aiTutorId: { type: String, default: null }, // e.g., "math-tutor", "science-tutor"
    // Conversation type for better organization
    conversationType: {
        type: String,
        enum: ["direct", "group", "ai"],
        default: "direct"
    },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ conversationType: 1 });
ConversationSchema.index({ isAiConversation: 1 });

export const Conversation = model("Conversation", ConversationSchema);
