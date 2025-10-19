import { api } from "../lib/api";

const BASE = "/api/announcements";

export const AnnouncementService = {
  list() {
    return api.get(`${BASE}/`);
  },
  get(id: string) {
    return api.get(`${BASE}/${id}`);
  },
  create(payload: { title: string; content: string; scope?: 'school' | 'class'; classId?: string | null; pinned?: boolean }) {
    return api.post(`${BASE}/`, payload);
  },
  update(id: string, payload: Partial<{ title: string; content: string; scope: 'school' | 'class'; classId: string | null; pinned: boolean }>) {
    return api.patch(`${BASE}/${id}`, payload);
  },
  remove(id: string) {
    return api.delete(`${BASE}/${id}`);
  },
};
