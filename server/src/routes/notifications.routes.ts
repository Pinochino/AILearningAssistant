import { Router } from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    getNotificationStats,
    createSystemNotification,
    createClassInviteNotification,
    createGradeUpdateNotification
} from "../controllers/notifications.controller.js";
import { authMiddleware, requireTeacherOrAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Get notifications
router.get("/", authMiddleware, getNotifications);
router.get("/stats", authMiddleware, getNotificationStats);
router.get("/unread-count", authMiddleware, getUnreadCount);

// Mark notifications as read
router.patch("/:notificationId/read", authMiddleware, markAsRead);
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete notification
router.delete("/:notificationId", authMiddleware, deleteNotification);

// Create notifications (for teachers/admins)
router.post("/system", authMiddleware, requireTeacherOrAdmin, createSystemNotification);
router.post("/class-invite", authMiddleware, requireTeacherOrAdmin, createClassInviteNotification);
router.post("/grade-update", authMiddleware, requireTeacherOrAdmin, createGradeUpdateNotification);

export default router;
