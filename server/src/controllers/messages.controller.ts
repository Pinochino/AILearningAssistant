import { Request, Response } from "express";
import MessagesService from "../services/messages.service.js";
import { User } from "../models/User.js";

export const createMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, content, type, replyTo, attachments } = req.body;
        const senderId = (req as any).user?.id;

        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const message = await MessagesService.sendMessage({
            conversationId,
            senderId,
            content,
            type,
            replyTo,
            attachments
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ error: "Failed to create message" });
    }
};

export const getConversationMessages = async (req: Request, res: Response) => {
    try {
        const { id: conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const messages = await MessagesService.getConversationMessages(
            conversationId,
            Number(page),
            Number(limit)
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error("Error getting conversation messages:", error);
        res.status(500).json({ error: "Failed to get messages" });
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const conversations = await MessagesService.getConversationsForUser(userId);

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error("Error getting conversations:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
};

export const createConversation = async (req: Request, res: Response) => {
    try {
        const { participants, name, isGroup, conversationType, aiTutorId, classId } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Add current user to participants if not already included
        const allParticipants = participants.includes(userId)
            ? participants
            : [userId, ...participants];

        const conversation = await MessagesService.createConversation({
            participants: allParticipants,
            name,
            isGroup,
            conversationType,
            aiTutorId,
            classId
        });

        res.status(201).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Failed to create conversation" });
    }
};

export const getOrCreateDirectConversation = async (req: Request, res: Response) => {
    try {
        const { userId: otherUserId } = req.params;
        const currentUserId = (req as any).user?.id;

        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const conversation = await MessagesService.getOrCreateDirectConversation(
            currentUserId,
            otherUserId
        );

        res.json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error("Error getting/creating direct conversation:", error);
        res.status(500).json({ error: "Failed to get/create conversation" });
    }
};

export const getOrCreateAiConversation = async (req: Request, res: Response) => {
    try {
        const { aiTutorId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const resolvedAiTutorId = aiTutorId || 'ai-default';

        const conversation = await MessagesService.getOrCreateAiConversation(
            userId,
            resolvedAiTutorId
        );

        res.json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error("Error getting/creating AI conversation:", error);
        res.status(500).json({ error: "Failed to get/create AI conversation" });
    }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const message = await MessagesService.markMessageAsRead(messageId, userId);

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: "Failed to mark message as read" });
    }
};

export const markConversationAsRead = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await MessagesService.markConversationAsRead(conversationId, userId);

        res.json({
            success: true,
            message: "Conversation marked as read"
        });
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        res.status(500).json({ error: "Failed to mark conversation as read" });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, announcementType, classId, targetUsers } = req.body;
        const senderId = (req as any).user?.id;

        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if user has permission to create announcements
        const role = String((req as any).user?.role || '').toLowerCase();
        if (!['teacher', 'admin', 'super_admin'].includes(role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        const result = await MessagesService.createAnnouncement({
            senderId,
            title,
            content,
            announcementType,
            classId,
            targetUsers
        });

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ error: "Failed to create announcement" });
    }
};

export const sendToAi = async (req: Request, res: Response) => {
    try {
        const { prompt, conversationId, aiTutorId } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const aiMessage = await MessagesService.sendToAiAndPersist({
            userId,
            prompt,
            conversationId,
            aiTutorId
        });

        res.json({
            success: true,
            data: aiMessage
        });
    } catch (error) {
        console.error("Error sending to AI:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
};
