import { api, setToken } from "../lib/api";
import { AuthUrls } from "../data/AuthUrls";

export const AuthService = {
  async login(payload: { email: string; password: string }) {
    const res: any = await api.post(AuthUrls.login, payload, { auth: false });
    const data = res?.data ?? res;
    const token = data?.accessToken || data?.token || data?.jwt || null;
    if (token) setToken(token);
    return data;
  },

  async logout() {
    try {
      await api.post(AuthUrls.logout, {}, { auth: true });
    } finally {
      setToken(null);
    }
  },

  async refreshToken() {
    const res: any = await api.post(AuthUrls.refreshToken, {}, { auth: false });
    const data = res?.data ?? res;
    const token = data?.accessToken || data?.token || data?.jwt || null;
    if (token) setToken(token);
    return data;
  },

  async me() {
    const res: any = await api.get(AuthUrls.me);
    return res?.data ?? res;
  },
};

export default AuthService;
