import { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types';
import { setAccessToken, clearAccessToken } from '../api/axiosClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Nguyễn Văn Giáo',
    email: 'teacher@example.com',
    role: 'teacher',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Trần Thị Học',
    email: 'student@example.com',
    role: 'student',
    createdAt: new Date(),
  },
];

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh token in background when it's about to expire
  const refreshTokenInBackground = async () => {
    try {
      console.log('🔄 Attempting background token refresh...');
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api';
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newToken = res.data?.data?.accessToken;
      if (newToken) {
        console.log('✅ Token refreshed in background');
        setAccessToken(newToken); // ✅ Set both in-memory and localStorage tokens
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Background token refresh failed:', error);
      // Don't logout user for background refresh failure
      return false;
    }
  };

  useEffect(() => {
    // Priority: Check accessToken first, then fallback to stored user
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');
    
    console.log('🔐 Auth Init:', { 
      hasToken: !!accessToken, 
      hasStoredUser: !!storedUser 
    });
    
    if (accessToken) {
      // Decode token and restore user session
      try {
        console.log('🔓 Decoding token...');
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log('📦 Token payload:', payload);
        
        // Check if token is expired or will expire soon (within 5 minutes)
        const now = Date.now() / 1000;
        const isExpired = payload.exp && payload.exp < now;
        const willExpireSoon = payload.exp && (payload.exp - now) < 300; // 5 minutes
        
        if (isExpired) {
          console.warn('⚠️ Token expired, clearing...');
          clearAccessToken();
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
        
        // Check roles array first (backend format: array of objects with name)
        if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
          const roleStr = payload.roles[0]?.name?.toLowerCase() || payload.roles[0]?.toLowerCase();
          console.log('🎭 Role from token:', roleStr);
          if (roleStr?.includes('admin') || roleStr?.includes('super_admin')) {
            role = 'admin';
          } else if (roleStr?.includes('teacher')) {
            role = 'teacher';
          }
        }
        
        // Fallback: Check username/email if role is still student
        if (role === 'student') {
          const username = (payload.username || '').toLowerCase();
          const email = (payload.email || '').toLowerCase();
          
          if (username.includes('teacher') || email.includes('teacher')) {
            role = 'teacher';
          } else if (username.includes('admin') || email.includes('admin')) {
            role = 'admin';
          }
        }
        
        console.log('✅ Final role:', role);
        
        const user: User = {
          id: payload.id || '1',
          name: payload.username || payload.email?.split('@')[0] || 'User',
          email: payload.email || 'unknown@example.com',
          role: role,
          createdAt: new Date(),
        };
        
        console.log('✅ User restored from token:', user);
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        console.error('❌ Failed to decode token:', error);
        clearAccessToken();
      }
    } else if (storedUser) {
      // Fallback to stored user if no token
      console.log('📂 Using stored user');
      setUser(JSON.parse(storedUser));
    } else {
      console.log('🚫 No auth data found');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Call real backend API using axios with credentials
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api';
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success && data.data) {
        const { user: userData, accessToken } = data.data;

        // Map role from backend (array of role objects) to frontend (single string)
        let role: 'admin' | 'teacher' | 'student' = 'student';
        if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
          const roleStr = userData.roles[0]?.name?.toLowerCase() || userData.roles[0]?.toLowerCase();
          console.log('🎭 Role from backend:', roleStr);
          if (roleStr?.includes('admin') || roleStr?.includes('super_admin')) {
            role = 'admin';
          } else if (roleStr?.includes('teacher')) {
            role = 'teacher';
          }
        }

        // Fallback: Check username/email if role is still student
        if (role === 'student') {
          const username = (userData.username || '').toLowerCase();
          const email = (userData.email || '').toLowerCase();

          if (username.includes('teacher') || email.includes('teacher')) {
            role = 'teacher';
          } else if (username.includes('admin') || email.includes('admin')) {
            role = 'admin';
          }
        }

        // Map backend user to frontend User type
        const user: User = {
          id: userData._id || '1',
          name: userData.username || userData.email?.split('@')[0] || 'User',
          email: userData.email,
          role: role,
          avatar: userData.avatar,
          createdAt: new Date(),
        };

        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setAccessToken(accessToken); // ✅ Set both in-memory and localStorage tokens
        setIsLoading(false);
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

  const logout = () => {
    setUser(null);
    clearAccessToken(); // ✅ Clear both in-memory and localStorage tokens
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}