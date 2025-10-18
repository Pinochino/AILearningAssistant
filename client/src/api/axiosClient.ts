// axiosClient.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000/api',
  withCredentials: true, 
})

let accessToken: string | null = null
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  console.log(accessToken)
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
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
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return axiosClient(originalRequest)
        }
      } catch (err) {
        setAccessToken(null)
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
