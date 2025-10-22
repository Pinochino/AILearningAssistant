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
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

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

function toRole(r: string | string[] | undefined): UserRole {
  if (Array.isArray(r)) {
    const list = r.map(x => String(x).toLowerCase());
    if (list.some(x => x.includes('admin'))) return 'admin';
    if (list.some(x => x.includes('teacher'))) return 'teacher';
    if (list.some(x => x.includes('student'))) return 'student';
    return 'student';
  }
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
          name: payload.username || payload.email || 'User',
          email: payload.email || 'unknown@local',
          role: toRole((payload as any).roles ?? (payload as any).role),
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
    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) return false;
      const json = await resp.json();
      const data = json?.data || json; // responseUtils wraps in { data }
      const token: string | undefined = data?.accessToken;
      const profile = data?.user;

      if (!token || !profile) return false;

      localStorage.setItem(TOKEN_KEY, token);

      const nextUser: User = {
        id: profile.id || profile._id || 'me',
        name: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username || profile.email || 'User',
        email: profile.email || email,
        role: toRole(profile.role ?? profile.roles),
        createdAt: new Date(),
      };

      setUser(nextUser);
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      return true;
    } catch {
      return false;
    }
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