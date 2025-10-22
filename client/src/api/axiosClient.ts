// axiosClient.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000/api',
  withCredentials: true,
})

let accessToken: string | null = null
export const setAccessToken = (token: string | null) => {
  accessToken = token
  // Also update localStorage for consistency
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

export const clearAccessToken = () => {
  accessToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('currentUser')
}

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  // Priority: Use in-memory token, then localStorage
  const token = accessToken || localStorage.getItem('accessToken')
  console.log('🔑 Using token:', token ? 'YES' : 'NO')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const res = await axios.post(
          'http://localhost:9000/api/auth/refresh-token',
          {},
          { withCredentials: true }
        )
        const newToken = res.data?.data?.accessToken
        if (newToken) {
          setAccessToken(newToken)
          // ✅ Save new token to localStorage
          localStorage.setItem('accessToken', newToken)
          console.log('🔄 Token refreshed and saved to localStorage')

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return axiosClient(originalRequest)
        }
      } catch (err) {
        console.error('❌ Refresh token failed:', err)
        clearAccessToken()
        // ✅ Redirect to login page if refresh failed
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }

        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
