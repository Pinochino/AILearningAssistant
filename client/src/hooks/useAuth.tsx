import React, { useState, useContext, createContext, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getSocket, ensureSocketConnected, resetSocket, refreshSocketAuthFromStorage } from '../lib/socket';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api';

/* ============================================================
   Giải mã JWT token để lấy thông tin user từ payload
   ============================================================ */
function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ============================================================
   Chuyển kiểu role về dạng chuẩn ('admin' | 'teacher' | 'student')
   ============================================================ */
function toRole(r: string | string[] | undefined): UserRole {
  if (Array.isArray(r)) {
    const list = r.map((x) => String(x).toLowerCase());
    if (list.some((x) => x.includes('admin'))) return 'admin';
    if (list.some((x) => x.includes('teacher'))) return 'teacher';
    if (list.some((x) => x.includes('student'))) return 'student';
    return 'student';
  }
  const v = String(r || '').toLowerCase();
  if (v.includes('admin')) return 'admin';
  if (v.includes('teacher')) return 'teacher';
  return 'student';
}

/* ============================================================
   Hook useAuth — dùng để truy cập context
   ============================================================ */
export function useAuth() {
  const context = useContext(AuthContext);
  console.log(context)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/* ============================================================
   Provider chứa logic auth + socket
   ============================================================ */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi app load lại: khôi phục token + user + connect socket nếu có token
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        const payload = decodeJwt(token);
        if (payload?.id) {
          const inferred: User = {
            id: payload.id,
            name: (payload as any).name || (payload as any).username || 'User',
            username: (payload as any).username || undefined,
            role: toRole((payload as any).roles ?? (payload as any).role),
            createdAt: new Date(),
          };
          setUser(inferred);
          localStorage.setItem('currentUser', JSON.stringify(inferred));

          // 🔥 Refresh auth payload and connect socket nếu có token
          try {
            refreshSocketAuthFromStorage();
            await ensureSocketConnected();
          } catch (err) {
            console.warn('Socket connect at startup failed', err);
          }

          setIsLoading(false);
          return;
        }

        if (willExpireSoon) {
          console.log('🔄 Token will expire soon, refreshing...');
          // Try to refresh token in background
          refreshTokenInBackground();
        }

        // Map role from token
        let role: 'admin' | 'teacher' | 'student' = 'student';
        let roleName = '';

        // Check roles array first (backend format: array of objects with name)
        if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
          // Get the first role (assuming highest privilege first)
          const firstRole = payload.roles[0];
          roleName = (typeof firstRole === 'string' ? firstRole : firstRole?.name || '').toLowerCase();
          console.log('🎭 Role from token:', { roleName, allRoles: payload.roles });

          if (roleName.includes('admin') || roleName.includes('super_admin')) {
            role = 'admin';
          } else if (roleName.includes('teacher')) {
            role = 'teacher';
          }
        }

        // Fallback: Check username if role is still student
        if (role === 'student') {
          const username = (payload.username || '').toLowerCase();

          if (username.includes('teacher')) {
            role = 'teacher';
          } else if (username.includes('admin')) {
            role = 'admin';
          }
        }

        console.log('✅ Final role:', role);

        try {
          const user: User = {
            id: payload.id || '1',
            name: payload.name || payload.fullName || payload.username || '',
            username: payload.username || '',
            email: payload.email || `${payload.username || 'user'}@example.com`,
            role: role,
            avatar: payload.avatar || '',
            createdAt: new Date(),
            _rawRoles: payload.roles || []
          };

          console.log('Restored user from token:', user);


          console.log('✅ User restored from token:', user);
          setUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (error) {
          console.error('❌ Failed to decode token:', error);
          clearAccessToken();
        }
      }

      // Nếu không có token thì thử lấy currentUser cũ (offline mode)
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          if (token) {
            try {
              await ensureSocketConnected();
            } catch (err) {
              console.warn('Socket reconnect from stored user failed', err);
            }
          }
        } catch {
          setUser(null);
        }
      }

      setIsLoading(false);
    })();
  }, []);

  /* ============================================================
     Login: fetch token, connect socket trước rồi mới set user
     ============================================================ */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) return false;
      const json = await resp.json();
      const data = json?.data || json;
      const token = data?.accessToken;
      const profile = data?.user; // optional; we'll prefer JWT payload for consistency
      if (!token) return false;

      // Lưu token
      localStorage.setItem(TOKEN_KEY, token);

      // Luôn suy ra user từ JWT để đồng nhất với flow khởi động lại (decodeJwt)
      const payload = decodeJwt(token);
      const nextUser: User = payload?.id ? {
        id: payload.id,
        name: (payload as any).name || (profile?.name || profile?.username) || 'User',
        role: toRole((payload as any).roles ?? (payload as any).role ?? (profile?.role ?? profile?.roles)),
        createdAt: new Date(),
      } : {
        // Fallback if JWT missing fields
        id: (profile as any)?.id || (profile as any)?._id,
        name: (profile as any)?.name || (profile as any)?.username || 'User',
        role: toRole((profile as any)?.role ?? (profile as any)?.roles),
        createdAt: new Date(),
      };

      // Set user immediately for UI correctness
      setUser(nextUser);
      localStorage.setItem('currentUser', JSON.stringify(nextUser));

      // 🔥 Reset any stale socket, refresh auth, then connect in background (do not block UI)
      (async () => {
        try {
          resetSocket();
          refreshSocketAuthFromStorage();
          await ensureSocketConnected();
        } catch (err) {
          console.warn('Socket ensure after login failed', err);
        }
      })();

      const loginData = json.data;
      console.log('Login response:', loginData);

      if (loginData.success && loginData.data) {
        const { user: userData, accessToken } = loginData.data;
        console.log('User data from backend:', userData);

        // Map role from backend (array of role objects/strings) to frontend role
        let role: 'admin' | 'teacher' | 'student' = 'student';
        let roleName = '';

        // Check if roles is an array and process it
        if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
          // Get the first role (assuming highest privilege first)
          const firstRole = userData.roles[0];
          roleName = (typeof firstRole === 'string' ? firstRole : firstRole?.name || '').toLowerCase();
          console.log('🎭 Role from backend:', { roleName, allRoles: userData.roles });

          if (roleName.includes('admin') || roleName.includes('super_admin')) {
            role = 'admin';
          } else if (roleName.includes('teacher')) {
            role = 'teacher';
          }
        }
        // Fallback to direct role property if roles array is not available
        else if (userData.role) {
          roleName = String(userData.role).toLowerCase();
          if (roleName.includes('admin') || roleName.includes('super_admin')) {
            role = 'admin';
          } else if (roleName.includes('teacher')) {
            role = 'teacher';
          }
        }

        console.log('Mapped role:', { role, roleName, allRoles: userData.roles });

        // Map backend user to frontend User type with all required fields
        const user: User = {
          id: userData.id || userData._id?.toString() || '',
          name: userData.name || userData.username || '',
          username: userData.username || '',
          email: userData.email || `${userData.username || 'user'}@example.com`, // Ensure email is always provided
          role: role,
          avatar: userData.avatar || '',
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          // Add raw roles for debugging
          _rawRoles: userData.roles || []
        };

        console.log('User object before setting state:', user);

        console.log('🔍 User data from login:', user);

        // Set user and token first
        setUser(user);
        localStorage.setItem(TOKEN_KEY, accessToken);

        // Force update all components that depend on user state
        window.dispatchEvent(new Event('storage'));

        // Add a small delay to ensure state is updated before redirecting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect based on role
        if (role === 'admin') {
          window.location.href = '/admin';
        } else if (role === 'teacher') {
          window.location.href = '/teacher';
        } else {
          window.location.href = '/student';
        }

        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  /* ============================================================
     Logout: clear token + user + optionally disconnect socket
     ============================================================ */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem(TOKEN_KEY);

    // Optional: ngắt kết nối socket
    try {
      const s = getSocket();
      if (s && s.connected) s.disconnect();
    } catch (err) {
      console.warn('Socket disconnect failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
