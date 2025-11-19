import React, { useState, useContext, createContext, useEffect } from 'react'
import { User, UserRole } from '../types'
import { getSocket, ensureSocketConnected, resetSocket, refreshSocketAuthFromStorage } from '../lib/socket'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'accessToken'
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000/api'

/* ============================================================
   Giải mã JWT token để lấy thông tin user từ payload
   ============================================================ */
function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/* ============================================================
   Clear token + user khỏi localStorage
   ============================================================ */
function clearAccessToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('currentUser')
  } catch {
    // ignore
  }
}

/* ============================================================
   Chuyển kiểu role về dạng chuẩn ('admin' | 'teacher' | 'student')
   ============================================================ */
function toRole(r: string | string[] | undefined): UserRole {
  if (Array.isArray(r)) {
    const list = r.map((x) => String(x).toLowerCase())
    if (list.some((x) => x.includes('admin'))) return 'admin'
    if (list.some((x) => x.includes('teacher'))) return 'teacher'
    if (list.some((x) => x.includes('student'))) return 'student'
    return 'student'
  }
  const v = String(r || '').toLowerCase()
  if (v.includes('admin')) return 'admin'
  if (v.includes('teacher')) return 'teacher'
  return 'student'
}

/* ============================================================
   Hook useAuth — dùng để truy cập context
   ============================================================ */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/* ============================================================
   Provider chứa logic auth + socket
   ============================================================ */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Khi app load lại: khôi phục token + user + connect socket nếu có token
  useEffect(() => {
    ;(async () => {
      const token = localStorage.getItem(TOKEN_KEY)

      if (token) {
        const payload = decodeJwt(token)

        // Nhánh 1: payload có id -> build user từ payload
        if (payload?.id) {
          const inferred: User = {
            id: payload.id,
            name: (payload as any).name || (payload as any).username || 'User',
            username: (payload as any).username || undefined,
            role: toRole((payload as any).roles ?? (payload as any).role),
            createdAt: new Date()
          }

          setUser(inferred)
          localStorage.setItem('currentUser', JSON.stringify(inferred))

          // 🔥 Refresh auth payload and connect socket nếu có token
          try {
            refreshSocketAuthFromStorage()
            await ensureSocketConnected()
          } catch (err) {
            console.warn('Socket connect at startup failed', err)
          }

          setIsLoading(false)
          return
        }

        // Nhánh 2: fallback nếu payload không có id nhưng vẫn decode được
        if (payload) {
          // Map role từ payload
          let role: 'admin' | 'teacher' | 'student' = 'student'
          let roleName = ''

          if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
            const firstRole = payload.roles[0]
            roleName = (typeof firstRole === 'string' ? firstRole : firstRole?.name || '').toLowerCase()
            if (roleName.includes('admin') || roleName.includes('super_admin')) {
              role = 'admin'
            } else if (roleName.includes('teacher')) {
              role = 'teacher'
            }
          } else {
            const username = (payload.username || '').toLowerCase()
            if (username.includes('teacher')) role = 'teacher'
            else if (username.includes('admin')) role = 'admin'
          }

          try {
            const restoredUser: User = {
              id: payload.id || '1',
              name: payload.name || payload.fullName || payload.username || '',
              username: payload.username || '',
              role: role,
              avatar: payload.avatar || '',
              createdAt: new Date(),
              _rawRoles: payload.roles || []
            }

            setUser(restoredUser)
            localStorage.setItem('currentUser', JSON.stringify(restoredUser))
          } catch (error) {
            console.error('❌ Failed to decode token:', error)
            clearAccessToken()
          }
        }
      }

      // Nếu không có token thì thử lấy currentUser cũ (offline mode)
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)

          if (token) {
            try {
              await ensureSocketConnected()
            } catch (err) {
              console.warn('Socket reconnect from stored user failed', err)
            }
          }
        } catch {
          setUser(null)
        }
      }

      setIsLoading(false)
    })()
  }, [])

  /* ============================================================
     Login: fetch token, connect socket trước rồi mới set user
     ============================================================ */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const resp = await fetch(`http://localhost:9000/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (!resp.ok) return false

      const json = await resp.json()
      const data = json?.data || json
      const token = data?.accessToken
      const profile = data?.user

      if (!token) return false

      // Lưu token
      localStorage.setItem(TOKEN_KEY, token)

      // Suy ra user từ JWT cho đồng nhất
      const payload = decodeJwt(token)
      const nextUser: User = payload?.id
        ? {
            id: payload.id,
            name: (payload as any).name || profile?.name || profile?.username || 'User',
            role: toRole((payload as any).roles ?? (payload as any).role ?? profile?.role ?? profile?.roles),
            createdAt: new Date(),
            username: profile?.username
          }
        : {
            id: (profile as any)?.id || (profile as any)?._id,
            name: (profile as any)?.name || (profile as any)?.username || 'User',
            role: toRole((profile as any)?.role ?? (profile as any)?.roles),
            createdAt: new Date(),
            username: profile?.username
          }

      setUser(nextUser)
      localStorage.setItem('currentUser', JSON.stringify(nextUser))

      // 🔥 Reset socket + auth rồi connect lại (background)
      ;(async () => {
        try {
          resetSocket()
          refreshSocketAuthFromStorage()
          await ensureSocketConnected()
        } catch (err) {
          console.warn('Socket ensure after login failed', err)
        }
      })()

      // Nếu backend trả dạng { success, data: { user, accessToken } } thì xử lý thêm:
      const loginData = json.data
      if (loginData?.success && loginData.data) {
        const { user: userData, accessToken } = loginData.data

        let role: 'admin' | 'teacher' | 'student' = 'student'
        let roleName = ''

        if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
          const firstRole = userData.roles[0]
          roleName = (typeof firstRole === 'string' ? firstRole : firstRole?.name || '').toLowerCase()

          if (roleName.includes('admin') || roleName.includes('super_admin')) {
            role = 'admin'
          } else if (roleName.includes('teacher')) {
            role = 'teacher'
          }
        } else if (userData.role) {
          roleName = String(userData.role).toLowerCase()
          if (roleName.includes('admin') || roleName.includes('super_admin')) {
            role = 'admin'
          } else if (roleName.includes('teacher')) {
            role = 'teacher'
          }
        }

        const userMapped: User = {
          id: userData.id || userData._id?.toString() || '',
          name: userData.name || userData.username || '',
          username: userData.username || '',
          role,
          avatar: userData.avatar || '',
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          _rawRoles: userData.roles || []
        }

        setUser(userMapped)
        localStorage.setItem(TOKEN_KEY, accessToken)

        window.dispatchEvent(new Event('storage'))
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (role === 'admin') window.location.href = '/admin'
        else if (role === 'teacher') window.location.href = '/teacher'
        else window.location.href = '/student'

        return true
      }

      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  /* ============================================================
     Logout: clear token + user + optionally disconnect socket
     ============================================================ */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem(TOKEN_KEY)

    try {
      const s = getSocket()
      if (s && s.connected) s.disconnect()
    } catch (err) {
      console.warn('Socket disconnect failed', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
