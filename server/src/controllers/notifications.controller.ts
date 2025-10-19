import { Request, Response } from "express";
import NotificationsService from "../services/notifications.service";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notifications = await NotificationsService.getUserNotifications(
            userId,
            Number(page),
            Number(limit),
            unreadOnly === 'true'
        );

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ error: "Failed to get notifications" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notification = await NotificationsService.markAsRead(notificationId, userId);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const count = await NotificationsService.markAllAsRead(userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const count = await NotificationsService.getUnreadCount(userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ error: "Failed to get unread count" });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notification = await NotificationsService.deleteNotification(notificationId, userId);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Failed to delete notification" });
    }
};

export const getNotificationStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const stats = await NotificationsService.getNotificationStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Error getting notification stats:", error);
        res.status(500).json({ error: "Failed to get notification stats" });
    }
};

export const createSystemNotification = async (req: Request, res: Response) => {
    try {
        const { title, body, targetUsers, priority, data } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Only admins can create system notifications
        if ((req as any).user?.role !== 'admin') {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        const notifications = await NotificationsService.createSystemNotification({
            title,
            body,
            targetUsers,
            priority,
            data
        });

        res.status(201).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Error creating system notification:", error);
        res.status(500).json({ error: "Failed to create system notification" });
    }
};

export const createClassInviteNotification = async (req: Request, res: Response) => {
    try {
        const { studentId, className, classId } = req.body;
        const teacherId = (req as any).user?.id;

        if (!teacherId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Only teachers and admins can create class invite notifications
        if ((req as any).user?.role !== 'teacher' && (req as any).user?.role !== 'admin') {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        const notification = await NotificationsService.createClassInviteNotification({
            studentId,
            teacherId,
            className,
            classId
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error creating class invite notification:", error);
        res.status(500).json({ error: "Failed to create class invite notification" });
    }
};

export const createGradeUpdateNotification = async (req: Request, res: Response) => {
    try {
        const { studentId, assignmentName, grade, assignmentId } = req.body;
        const teacherId = (req as any).user?.id;

        if (!teacherId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Only teachers and admins can create grade update notifications
        if ((req as any).user?.role !== 'teacher' && (req as any).user?.role !== 'admin') {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        const notification = await NotificationsService.createGradeUpdateNotification({
            studentId,
            teacherId,
            assignmentName,
            grade,
            assignmentId
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error creating grade update notification:", error);
        res.status(500).json({ error: "Failed to create grade update notification" });
    }
};
