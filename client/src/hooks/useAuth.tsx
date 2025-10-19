import React from 'react';
import { useState, useContext, createContext, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'atiui_token';

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function toRole(r: string | undefined): UserRole {
  const v = String(r || '').toLowerCase();
  if (v.includes('admin')) return 'admin';
  if (v.includes('teacher')) return 'teacher';
  return 'student';
}

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
    // Prefer JWT token to infer user
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.id) {
        const inferred: User = {
          id: payload.id,
          name: [payload.firstName, payload.lastName].filter(Boolean).join(' ') || payload.email || 'User',
          email: payload.email || 'unknown@local',
          role: toRole(payload.role),
          createdAt: new Date(),
        };
        setUser(inferred);
        localStorage.setItem('currentUser', JSON.stringify(inferred));
        setIsLoading(false);
        return;
      }
    }

    // Fallback to stored user (if any)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with real backend auth when available
    // Currently, authentication is derived from the JWT already in localStorage.
    // Return false to keep LoginForm behavior unless a token is present.
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}