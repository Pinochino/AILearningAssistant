import { Server, Socket } from "socket.io";
import { OnlineService } from "./online.service.js";
import MessagesService from "./messages.service.js";
import NotificationsService from "./notifications.service.js";

interface SocketData {
    user: {
        id: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

export default function handleSocket(io: Server, socket: Socket) {
    const userData = socket.data as SocketData;
    const userId = userData.user?.id;

    if (!userId) {
        socket.disconnect();
        return;
    }

    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Add user to online list
    OnlineService.addOnlineSocket(userId, socket.id);

    // Send user their online status
    socket.emit('connection_established', {
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    // Join user to their personal room for notifications
    socket.join(`user:${userId}`);

    // Handle conversation events
    socket.on("join_conversation", async (data: { conversationId: string }) => {
        try {
            const { conversationId } = data;
            socket.join(`conversation:${conversationId}`);

            // Mark conversation as read
            await MessagesService.markConversationAsRead(conversationId, userId);

            socket.emit('joined_conversation', { conversationId });
            console.log(`User ${userId} joined conversation ${conversationId}`);
        } catch (error) {
            socket.emit('error', { message: 'Failed to join conversation' });
        }
    });

    socket.on("leave_conversation", (data: { conversationId: string }) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
        socket.emit('left_conversation', { conversationId });
        console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle message sending
    socket.on("send_message", async (data: {
        conversationId: string;
        content: string;
        type?: string;
        replyTo?: string;
        attachments?: any[];
        clientId?: string;
    }) => {
        try {
            const message = await MessagesService.sendMessage({
                conversationId: data.conversationId,
                senderId: userId,
                content: data.content,
                type: (data.type as any) || "text",
                replyTo: data.replyTo,
                attachments: data.attachments,
                metadata: data.clientId ? { clientId: data.clientId } : undefined
            });

            // Emit to conversation room
            io.to(`conversation:${data.conversationId}`).emit("new_message", {
                id: message._id,
                conversationId: message.conversation,
                sender: message.sender,
                senderId: message.sender,
                senderName: `${userData.user.firstName} ${userData.user.lastName}`.trim(),
                clientId: data.clientId,
                content: message.content,
                type: message.type,
                attachments: message.attachments,
                replyTo: message.replyTo,
                createdAt: message.createdAt,
                readBy: message.readBy
            });

            // Emit notifications to receivers
            if ((message as any).$receivers) {
                for (const receiverId of (message as any).$receivers) {
                    const receiverSockets = await OnlineService.getOnlineSockets(receiverId);
                    receiverSockets.forEach(socketId => {
                        io.to(socketId).emit("notification", {
                            type: "message",
                            title: "Tin nhắn mới",
                            body: message.content.slice(0, 100) + (message.content.length > 100 ? "..." : ""),
                            data: {
                                conversationId: message.conversation,
                                messageId: message._id,
                                senderName: `${userData.user.firstName} ${userData.user.lastName}`
                            }
                        });
                    });
                }
            }

            console.log(`Message sent in conversation ${data.conversationId} by user ${userId}`);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Handle AI message
    socket.on("ai_message", async (data: {
        conversationId: string;
        prompt: string;
        aiTutorId?: string;
    }) => {
        try {
            // Show typing indicator
            socket.emit('ai_typing', { conversationId: data.conversationId, isTyping: true });
            io.to(`conversation:${data.conversationId}`).emit('ai_typing', {
                conversationId: data.conversationId,
                isTyping: true
            });

            const aiMessage = await MessagesService.sendToAiAndPersist({
                userId,
                prompt: data.prompt,
                conversationId: data.conversationId,
                aiTutorId: data.aiTutorId
            });

            // Hide typing indicator
            socket.emit('ai_typing', { conversationId: data.conversationId, isTyping: false });
            io.to(`conversation:${data.conversationId}`).emit('ai_typing', {
                conversationId: data.conversationId,
                isTyping: false
            });

            // Emit AI response to conversation room
            io.to(`conversation:${data.conversationId}`).emit("ai_response", {
                id: aiMessage._id,
                conversationId: aiMessage.conversation,
                content: aiMessage.content,
                type: aiMessage.type,
                aiTutorId: aiMessage.aiTutorId,
                metadata: aiMessage.metadata,
                createdAt: aiMessage.createdAt
            });

            console.log(`AI response sent in conversation ${data.conversationId} for user ${userId}`);
        } catch (error) {
            console.error("Error getting AI response:", error);
            socket.emit('ai_typing', { conversationId: data.conversationId, isTyping: false });
            io.to(`conversation:${data.conversationId}`).emit('ai_typing', {
                conversationId: data.conversationId,
                isTyping: false
            });
            socket.emit("error", { message: "Failed to get AI response" });
        }
    });

    // Handle message read status
    socket.on("mark_message_read", async (data: { messageId: string }) => {
        try {
            await MessagesService.markMessageAsRead(data.messageId, userId);
            socket.emit('message_read', { messageId: data.messageId });
        } catch (error) {
            socket.emit("error", { message: "Failed to mark message as read" });
        }
    });

    // Handle typing indicators
    socket.on("typing_start", (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
            userId,
            conversationId: data.conversationId,
            isTyping: true,
            userName: `${userData.user.firstName} ${userData.user.lastName}`
        });
    });

    socket.on("typing_stop", (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
            userId,
            conversationId: data.conversationId,
            isTyping: false,
            userName: `${userData.user.firstName} ${userData.user.lastName}`
        });
    });

    // Handle notification events
    socket.on("mark_notification_read", async (data: { notificationId: string }) => {
        try {
            const notification = await NotificationsService.markAsRead(data.notificationId, userId);
            if (notification) {
                socket.emit('notification_read', { notificationId: data.notificationId });
            }
        } catch (error) {
            socket.emit("error", { message: "Failed to mark notification as read" });
        }
    });

    socket.on("mark_all_notifications_read", async () => {
        try {
            const count = await NotificationsService.markAllAsRead(userId);
            socket.emit('all_notifications_read', { count });
        } catch (error) {
            socket.emit("error", { message: "Failed to mark all notifications as read" });
        }
    });

    // Handle user status updates
    socket.on("update_status", async (data: { status: string }) => {
        try {
            // Update user status in Redis
            await OnlineService.setUserOffline(userId);
            if (data.status === 'online') {
                await OnlineService.addOnlineSocket(userId, socket.id);
            }

            // Broadcast status change to all user's conversations
            const conversations = await MessagesService.getConversationsForUser(userId);
            conversations.forEach((conv: { _id: any; }) => {
                io.to(`conversation:${conv._id}`).emit('user_status_changed', {
                    userId,
                    status: data.status,
                    lastSeen: new Date().toISOString()
                });
            });
        } catch (error) {
            socket.emit("error", { message: "Failed to update status" });
        }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
        try {
            await OnlineService.removeOnlineSocket(userId, socket.id);
            console.log(`User ${userId} disconnected`);

            // Broadcast offline status to conversations
            const conversations = await MessagesService.getConversationsForUser(userId);
            conversations.forEach((conv: { _id: any; }) => {
                io.to(`conversation:${conv._id}`).emit('user_status_changed', {
                    userId,
                    status: 'offline',
                    lastSeen: new Date().toISOString()
                });
            });
        } catch (error) {
            console.error("Error handling disconnect:", error);
        }
    });

    // Handle errors
    socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
    });
}