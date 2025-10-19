import { api } from "../lib/api";

const BASE = "/api/notifications";

export const NotificationsService = {
  getAll() {
    return api.get(`${BASE}/`);
  },
  getStats() {
    return api.get(`${BASE}/stats`);
  },
  getUnreadCount() {
    return api.get(`${BASE}/unread-count`);
  },
  markAsRead(notificationId: string) {
    return api.patch(`${BASE}/${notificationId}/read`);
  },
  markAllAsRead() {
    return api.patch(`${BASE}/read-all`);
  },
  delete(notificationId: string) {
    return api.delete(`${BASE}/${notificationId}`);
  },
  // Creation (guarded by teacher/admin on backend)
  createSystem(payload: { title: string; content: string; targetUsers?: string[] }) {
    return api.post(`${BASE}/system`, payload);
  },
  createClassInvite(payload: { classId: string; userId: string }) {
    return api.post(`${BASE}/class-invite`, payload);
  },
  createGradeUpdate(payload: { classId: string; userId: string; grade: number }) {
    return api.post(`${BASE}/grade-update`, payload);
  },
};
