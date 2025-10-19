import { api } from "../lib/api";

const BASE = "/api/users";

export const UsersService = {
  search(params: { search?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return api.get(`${BASE}/list${qs ? `?${qs}` : ""}`);
  },
  getById(userId: string) {
    return api.get(`${BASE}/detail/${userId}`);
  },
};
export default UsersService;
