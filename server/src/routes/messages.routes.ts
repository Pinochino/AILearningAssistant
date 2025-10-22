import { Router } from "express";
import {
    createMessage,
    getConversationMessages,
    getConversations,
    createConversation,
    getOrCreateDirectConversation,
    getOrCreateAiConversation,
    markMessageAsRead,
    markConversationAsRead,
    createAnnouncement,
    sendToAi,
    updateConversation,
    deleteConversation
} from "../controllers/messages.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireTeacherOrAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Message routes
router.post("/", authMiddleware, createMessage); // fallback: send via REST
router.post("/ai", authMiddleware, sendToAi); // Send message to AI

// Conversation routes
router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations", authMiddleware, createConversation);
router.get("/conversations/:id/messages", authMiddleware, getConversationMessages);
router.post("/conversations/:id/read", authMiddleware, markConversationAsRead);
router.patch("/conversations/:id", authMiddleware, updateConversation);
router.delete("/conversations/:id", authMiddleware, deleteConversation);

// Direct conversation routes
router.get("/direct/:userId", authMiddleware, getOrCreateDirectConversation);

// AI conversation routes
// Support both: with aiTutorId and without (default)
router.get("/ai", authMiddleware, getOrCreateAiConversation);
router.get("/ai/:aiTutorId", authMiddleware, getOrCreateAiConversation);

// Message actions
router.post("/:messageId/read", authMiddleware, markMessageAsRead);

// Announcement routes (for teachers/admins)
router.post("/announcements", authMiddleware, requireTeacherOrAdmin, createAnnouncement);

export default router;
