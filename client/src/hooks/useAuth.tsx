import { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types';
import { setAccessToken, clearAccessToken } from '../api/axiosClient';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  const context = useContext(AuthContext);
  console.log(context)
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
        
       const user: User = {
  id: payload.id || '1',
  name: payload.fullName || payload.name || '', // ❌ bỏ fallback về username
  username: payload.username,
  role: role,
  createdAt: new Date(),
  avatar: payload.avatar
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

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Call real backend API using axios with credentials
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api';
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );

      const data = response.data;
      console.log('Login response:', data); // Debug log

      if (data.success && data.data) {
        const { user: userData, accessToken } = data.data;
        console.log('User data from backend:', userData); // Debug log

        // Map role from backend (array of role objects/strings) to frontend role
        let role: 'admin' | 'teacher' | 'student' = 'student';
        
        // Check if roles is an array and process it
        if (userData.roles && Array.isArray(userData.roles)) {
          // Convert all role names to lowercase for case-insensitive comparison
          const roleNames = userData.roles.map((r: any) => 
            (typeof r === 'string' ? r : r?.name || '').toLowerCase()
          );
          
          // Check for admin or teacher role (admin has higher priority)
          if (roleNames.some((r: string) => r.includes('admin') || r.includes('super_admin'))) {
            role = 'admin';
          } else if (roleNames.some((r: string) => r.includes('teacher'))) {
            role = 'teacher';
          }
        } 
        // Fallback to direct role property if roles array is not available
        else if (userData.role) {
          const roleStr = String(userData.role).toLowerCase();
          if (roleStr.includes('admin') || roleStr.includes('super_admin')) {
            role = 'admin';
          } else if (roleStr.includes('teacher')) {
            role = 'teacher';
          }
        }

        console.log('Mapped role:', role); // Debug log

        // Map backend user to frontend User type with all required fields
        const user: User = {
          id: userData.id || userData._id?.toString() || '',
          name: userData.name || userData.username || '',
          username: userData.username || '',
          email: userData.email || `${userData.username || 'user'}@example.com`, // Ensure email is always provided
          role: role,
          avatar: userData.avatar || '',
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
};

        console.log('🔍 User data from login:', user);

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