import { Schema, model, Types } from "mongoose";

const NotificationSchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true }, // who receives
    actor: { type: Types.ObjectId, ref: "User" }, // who triggered it (could be system)
    type: {
        type: String,
        required: true,
        enum: [
            "message", "mention", "class_invite", "ai_reply",
            "announcement", "assignment", "quiz", "grade_update",
            "system", "friend_request", "class_update",
            // New product-specific types
            "class_join_request", "class_join_result", "comment_reply", "new_comment_on_my_content"
        ]
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} }, // extra metadata (conversationId, messageId...)
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    // For push notifications
    pushSent: { type: Boolean, default: false },
    pushSentAt: { type: Date, default: null },
    // Priority level
    priority: {
        type: String,
        enum: ["low", "normal", "high", "urgent"],
        default: "normal"
    },
    // Expiration
    expiresAt: { type: Date, default: null },
    // For announcements
    isAnnouncement: { type: Boolean, default: false },
    announcementId: { type: Types.ObjectId, ref: "Message", default: null },
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ isAnnouncement: 1 });
NotificationSchema.index({ expiresAt: 1 });

export const Notification = model("Notification", NotificationSchema);
