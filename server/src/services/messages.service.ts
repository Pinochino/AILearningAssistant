import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { User } from "../models/User.js";
import AiBridgeService from "./ai-bridge.service.js";

interface SendMessageData {
    conversationId: string;
    senderId: string;
    content: string;
    type?: "text" | "system" | "ai" | "attachment" | "announcement";
    attachments?: Array<{ url: string; filename: string; mimeType?: string; size?: number }>;
    replyTo?: string;
    metadata?: any;
}

interface CreateConversationData {
    participants: string[];
    name?: string;
    isGroup?: boolean;
    conversationType?: "direct" | "group" | "ai" | "class_announcement" | "school_announcement";
    aiTutorId?: string;
    classId?: string;
    isSchoolWide?: boolean;
}

class MessagesService {
    static async sendMessage(data: SendMessageData) {
        const { conversationId, senderId, content, type = "text", attachments, replyTo, metadata } = data;

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            content,
            type,
            attachments,
            replyTo,
            metadata
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date()
        });

        // Get conversation details
        const conversation = await Conversation.findById(conversationId)
            .populate('participants', 'firstName lastName role')
            .lean();

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Compute receivers (participants except sender)
        const receivers = conversation.participants
            .filter((p: any) => p._id.toString() !== senderId.toString())
            .map((p: any) => p._id.toString());

        // Attach receivers for socket flow
        (message as any).$receivers = receivers;
        (message as any).$conversation = conversation;

        return message;
    }

    static async createConversation(data: CreateConversationData) {
        const {
            participants,
            name,
            isGroup = false,
            conversationType = "direct",
            aiTutorId,
            classId,
            isSchoolWide = false
        } = data;

        // Validate participants exist
        const users = await User.find({ _id: { $in: participants } });
        if (users.length !== participants.length) {
            throw new Error("Some participants not found");
        }

        const conversation = await Conversation.create({
            participants,
            name,
            isGroup,
            conversationType,
            aiTutorId,
            classId,
            isSchoolWide
        });

        return conversation;
    }

    static async getConversationMessages(conversationId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name username firstName lastName avatar role email')
            .populate('replyTo', 'content sender')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return messages.reverse(); // Return in chronological order
    }

    static async getConversationsForUser(userId: string) {
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'name username firstName lastName avatar role email')
            .populate('lastMessage')
            .populate('lastMessage.sender', 'name username firstName lastName avatar email')
            .sort({ updatedAt: -1 })
            .lean();

        // Attach unreadCount based on lastMessage.readBy for lightweight preview bolding
        const withUnread = (conversations || []).map((c: any) => {
            let unreadCount = Number(c?.unreadCount || 0);
            const lm = c?.lastMessage;
            if (lm && typeof lm === 'object') {
                const senderId = String(lm?.sender?._id || lm?.sender || lm?.senderId || '');
                const readBy = Array.isArray(lm?.readBy) ? lm.readBy : [];
                const hasMeRead = readBy.some((r: any) => String((r?.user || r)) === String(userId));
                if (senderId && senderId !== String(userId) && !hasMeRead) unreadCount = Math.max(unreadCount, 1);
            }
            return { ...c, unreadCount };
        });

        return withUnread as any;
    }

    static async getOrCreateDirectConversation(user1Id: string, user2Id: string) {
        // Check if direct conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [user1Id, user2Id] },
            conversationType: "direct",
            isGroup: false
        });

        if (!conversation) {
            conversation = await this.createConversation({
                participants: [user1Id, user2Id],
                conversationType: "direct"
            });
        }

        return conversation;
    }

    static async getOrCreateAiConversation(userId: string, aiTutorId: string) {
        // Check if AI conversation already exists
        let conversation = await Conversation.findOne({
            participants: userId,
            conversationType: "ai",
            aiTutorId
        });

        if (!conversation) {
            conversation = await this.createConversation({
                participants: [userId],
                conversationType: "ai",
                aiTutorId,
                name: `AI Tutor - ${aiTutorId}`
            });
        }

        return conversation;
    }

    static async sendToAiAndPersist(data: {
        userId: string;
        prompt: string;
        conversationId: string;
        aiTutorId?: string;
    }) {
        const { userId, prompt, conversationId, aiTutorId } = data;

        // Get previous messages for context
        const previousMessages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Call AI service
        const aiResponse = await AiBridgeService.ask(prompt, {
            userId,
            conversationId,
            aiTutorId,
            previousMessages: previousMessages.map(msg => ({
                role: msg.sender ? "user" : "assistant",
                content: msg.content
            }))
        });

        // Create AI message
        const aiMessage = await Message.create({
            conversation: conversationId,
            sender: null, // AI doesn't have a user ID
            content: aiResponse.answer,
            type: "ai",
            aiTutorId,
            metadata: {
                confidence: aiResponse.confidence,
                sources: aiResponse.source,
            }
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: aiMessage._id,
            updatedAt: new Date()
        });

        return aiMessage;
    }

    static async markMessageAsRead(messageId: string, userId: string) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        // Check if already read by this user
        const alreadyRead = message.readBy.some(
            (read: any) => read.user.toString() === userId.toString()
        );

        if (!alreadyRead) {
            message.readBy.push({
                user: userId,
                readAt: new Date()
            });
            await message.save();
        }

        return message;
    }

    static async markConversationAsRead(conversationId: string, userId: string) {
        // Mark all unread messages in conversation as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                "readBy.user": { $ne: userId }
            },
            {
                $push: {
                    readBy: {
                        user: userId,
                        readAt: new Date()
                    }
                }
            }
        );
    }

    static async createAnnouncement(data: {
        senderId: string;
        title: string;
        content: string;
        announcementType: "class" | "school";
        classId?: string;
        targetUsers?: string[];
    }) {
        const { senderId, title, content, announcementType, classId, targetUsers } = data;

        // Create announcement conversation
        const conversation = await this.createConversation({
            participants: targetUsers || [],
            name: title,
            conversationType: announcementType === "class" ? "class_announcement" : "school_announcement",
            classId,
            isSchoolWide: announcementType === "school"
        });

        // Create announcement message
        const message = await this.sendMessage({
            conversationId: conversation._id.toString(),
            senderId,
            content,
            type: "announcement",
            metadata: {
                announcementType,
                title,
                classId
            }
        });

        return { conversation, message };
    }
}

export default MessagesService;
