import { Notification } from "../models/notification.model.js";
import { User } from "../models/User.js";
import { OnlineService } from "./online.service.js";
import { Server } from "socket.io";

interface CreateNotificationData {
    user: string;
    actor?: string;
    type: "message" | "mention" | "class_invite" | "ai_reply" | "announcement" | "assignment" | "quiz" | "grade_update" | "system" | "friend_request" | "class_update";
    title: string;
    body: string;
    data?: any;
    priority?: "low" | "normal" | "high" | "urgent";
    expiresAt?: Date;
}

class NotificationsService {
    static async createNotification(data: CreateNotificationData) {
        const notification = await Notification.create({
            ...data,
            priority: data.priority || "normal"
        });

        // Send real-time notification if user is online
        const isOnline = await OnlineService.isUserOnline(data.user);
        if (isOnline) {
            // This will be handled by socket handler
            (notification as any).$shouldEmit = true;
        }

        return notification;
    }

    static async createNotificationsForMessage(message: any, receivers: string[]) {
        const docs = receivers.map(uid => ({
            user: uid,
            actor: message.sender,
            type: "message" as const,
            title: "Tin nhắn mới",
            body: message.content?.slice(0, 120) + (message.content?.length > 120 ? "..." : ""),
            data: {
                conversationId: message.conversation,
                messageId: message._id,
                senderName: message.sender?.firstName + " " + message.sender?.lastName
            },
            priority: "normal" as const
        }));

        const notifications = await Notification.insertMany(docs);

        // Mark for real-time emission
        notifications.forEach(notif => {
            (notif as any).$shouldEmit = true;
        });

        return notifications;
    }

    static async createAnnouncementNotifications(data: {
        title: string;
        body: string;
        announcementType: "class" | "school";
        classId?: string;
        targetUsers: string[];
        senderId: string;
    }) {
        const { title, body, announcementType, classId, targetUsers, senderId } = data;

        const notifications = await Promise.all(
            targetUsers.map(userId =>
                this.createNotification({
                    user: userId,
                    actor: senderId,
                    type: "announcement",
                    title,
                    body,
                    data: {
                        announcementType,
                        classId,
                        isAnnouncement: true
                    },
                    priority: announcementType === "school" ? "high" : "normal"
                })
            )
        );

        return notifications;
    }

    static async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
        const skip = (page - 1) * limit;
        const filter: any = { user: userId };

        // Restrict types by role
        const user = await User.findById(userId).lean();
        const role = (user as any)?.role;
        const teacherTypes = ["class_join_request", "comment_reply", "new_comment_on_my_content"];
        const studentTypes = ["class_join_result", "comment_reply", "new_comment_on_my_content"];
        if (role === 'teacher') filter.type = { $in: teacherTypes };
        if (role === 'student') filter.type = { $in: studentTypes };

        if (unreadOnly) {
            filter.read = false;
        }

        const notifications = await Notification.find(filter)
            .populate('actor', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return notifications;
    }

    static async markAsRead(notificationId: string, userId: string) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId, read: false },
            {
                read: true,
                readAt: new Date()
            },
            { new: true }
        );

        return notification;
    }

    static async markAllAsRead(userId: string) {
        const result = await Notification.updateMany(
            { user: userId, read: false },
            {
                read: true,
                readAt: new Date()
            }
        );

        return result.modifiedCount;
    }

    static async getUnreadCount(userId: string) {
        const filter: any = { user: userId, read: false };
        const user = await User.findById(userId).lean();
        const role = (user as any)?.role;
        const teacherTypes = ["class_join_request", "comment_reply", "new_comment_on_my_content"];
        const studentTypes = ["class_join_result", "comment_reply", "new_comment_on_my_content"];
        if (role === 'teacher') filter.type = { $in: teacherTypes };
        if (role === 'student') filter.type = { $in: studentTypes };
        return await Notification.countDocuments(filter);
    }

    static async deleteNotification(notificationId: string, userId: string) {
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            user: userId
        });

        return notification;
    }

    static async deleteExpiredNotifications() {
        const result = await Notification.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        return result.deletedCount;
    }

    static async createSystemNotification(data: {
        title: string;
        body: string;
        targetUsers: string[];
        priority?: "low" | "normal" | "high" | "urgent";
        data?: any;
    }) {
        const { title, body, targetUsers, priority = "normal", data: extraData } = data;

        const notifications = await Promise.all(
            targetUsers.map(userId =>
                this.createNotification({
                    user: userId,
                    type: "system",
                    title,
                    body,
                    data: extraData,
                    priority
                })
            )
        );

        return notifications;
    }

    static async createClassInviteNotification(data: {
        studentId: string;
        teacherId: string;
        className: string;
        classId: string;
    }) {
        const { studentId, teacherId, className, classId } = data;

        return await this.createNotification({
            user: studentId,
            actor: teacherId,
            type: "class_invite",
            title: "Lời mời tham gia lớp học",
            body: `Bạn được mời tham gia lớp ${className}`,
            data: { classId, className },
            priority: "normal"
        });
    }

    static async createGradeUpdateNotification(data: {
        studentId: string;
        teacherId: string;
        assignmentName: string;
        grade: string;
        assignmentId: string;
    }) {
        const { studentId, teacherId, assignmentName, grade, assignmentId } = data;

        return await this.createNotification({
            user: studentId,
            actor: teacherId,
            type: "grade_update",
            title: "Điểm số được cập nhật",
            body: `Điểm cho bài tập "${assignmentName}": ${grade}`,
            data: { assignmentId, assignmentName, grade },
            priority: "normal"
        });
    }

    static async emitNotification(io: Server, notification: any) {
        if (!notification.$shouldEmit) return;

        const userSockets = await OnlineService.getOnlineSockets(notification.user);

        userSockets.forEach(socketId => {
            io.to(socketId).emit('notification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                priority: notification.priority,
                createdAt: notification.createdAt
            });
        });
    }

    static async getNotificationStats(userId: string) {
        const stats = await Notification.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    unread: { $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] } },
                    byType: {
                        $push: {
                            type: "$type",
                            read: "$read"
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return { total: 0, unread: 0, byType: {} };
        }

        const result = stats[0];
        const byType: any = {};

        result.byType.forEach((item: any) => {
            if (!byType[item.type]) {
                byType[item.type] = { total: 0, unread: 0 };
            }
            byType[item.type].total++;
            if (!item.read) {
                byType[item.type].unread++;
            }
        });

        return {
            total: result.total,
            unread: result.unread,
            byType
        };
    }
}

export default NotificationsService;
