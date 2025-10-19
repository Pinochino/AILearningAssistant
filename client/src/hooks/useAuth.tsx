import React, { useState, useContext, createContext, useEffect } from 'react';
import { User, UserRole } from '../types';

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
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('⚠️ Token expired');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUser');
          setIsLoading(false);
          return;
        }
        
        // Map role from token
        let role: 'admin' | 'teacher' | 'student' = 'student';
        
        // Check roles array first
        if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
          const roleStr = payload.roles[0]?.toLowerCase() || '';
          console.log('🎭 Role from token:', roleStr);
          if (roleStr.includes('admin')) {
            role = 'admin';
          } else if (roleStr.includes('teacher')) {
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
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
      // Call real backend API
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data);
        setIsLoading(false);
        return false;
      }

      // Backend returns: { success: true, data: { user, accessToken, refreshToken } }
      if (data.success && data.data) {
        const { user: userData, accessToken } = data.data;
        
        // Map role from backend (array of role names) to frontend (single string)
        let role: 'admin' | 'teacher' | 'student' = 'student';
        if (userData.role && Array.isArray(userData.role)) {
          const roleStr = userData.role[0]?.toLowerCase();
          if (roleStr?.includes('admin')) {
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
        localStorage.setItem('accessToken', accessToken);
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}