import { Schema, model, Types } from "mongoose";

const MessageSchema = new Schema({
    conversation: { type: Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Types.ObjectId, ref: "User", required: function (this: any) { return this.type !== 'ai'; } },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ["text", "system", "ai", "attachment"],
        default: "text"
    },
    attachments: [{
        url: String,
        filename: String,
        mimeType: String,
        size: Number
    }],
    readBy: [{
        user: { type: Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now }
    }],
    // For AI messages
    aiResponse: { type: String, default: null },
    aiTutorId: { type: String, default: null },
    // Message metadata
    metadata: { type: Schema.Types.Mixed, default: {} },
    // Reply to another message
    replyTo: { type: Types.ObjectId, ref: "Message", default: null },
}, { timestamps: true });

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ type: 1 });

export const Message = model("Message", MessageSchema);
