import { api } from "../lib/api";

// Base path is /api/messages on the backend
const BASE = "/api/messages";

export const MessagesService = {
  // Conversations
  getConversations() {
    return api.get(`${BASE}/conversations`);
  },
  updateConversation(conversationId: string, payload: { name?: string }) {
    return api.patch(`${BASE}/conversations/${conversationId}`, payload);
  },
  deleteConversation(conversationId: string) {
    return api.delete(`${BASE}/conversations/${conversationId}`);
  },
  createConversation(payload: {
    participants: string[];
    name?: string;
    isGroup?: boolean;
    conversationType?: string;
    aiTutorId?: string | null;
    classId?: string | null;
  }) {
    return api.post(`${BASE}/conversations`, payload);
  },
  getConversationMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return api.get(`${BASE}/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`);
  },
  markConversationAsRead(conversationId: string) {
    return api.post(`${BASE}/conversations/${conversationId}/read`);
  },

  // Direct/AI conversation helpers
  getOrCreateDirect(userId: string) {
    return api.get(`${BASE}/direct/${userId}`);
  },
  getOrCreateAi(aiTutorId?: string) {
    return api.get(`${BASE}/ai${aiTutorId ? `/${aiTutorId}` : ""}`);
  },

  // Messages
  createMessage(payload: {
    conversationId: string;
    content: string;
    type?: string;
    replyTo?: string | null;
    attachments?: any[];
  }) {
    return api.post(`${BASE}/`, payload);
  },
  markMessageAsRead(messageId: string) {
    return api.post(`${BASE}/${messageId}/read`);
  },

  // Announcements
  createAnnouncement(payload: {
    title: string;
    content: string;
    announcementType?: string;
    classId?: string | null;
    targetUsers?: string[];
  }) {
    return api.post(`${BASE}/announcements`, payload);
  },

  // AI bridge
  sendToAi(payload: { prompt: string; conversationId?: string; aiTutorId?: string }) {
    return api.post(`${BASE}/ai`, payload);
  },
};
