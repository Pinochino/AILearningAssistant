import axios from 'axios'
import { getAccessToken, setAccessToken } from '../utils/AccessToken'

const axiosClient = axios.create({
  baseURL: 'http://localhost:9000/api/',
  timeout: 5000,
  withCredentials: true
})

let isRefreshing = false
let failedQueue: {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = getAccessToken()
    if (token) {
      config.headers[`Authorization`] = `Bearer ${token}`
    }

    return config
  },
  function (error: any) {
    // Do something with request error
    return Promise.reject(error)
  },
  { synchronous: true, runWhen: () => true /* This function returns true */ }
)

// Add a response interceptor
axiosClient.interceptors.response.use(
  function onFulfilled(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    return response
  },
  async function onRejected(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers[`Authorization`] = `Bearer ` + token
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `http://localhost:9000/api/auth/refresh-token`,
          {},
          {
            withCredentials: true
          }
        )

        const newToken = data.accessToken
        setAccessToken(newToken)
        processQueue(null, newToken)

        originalRequest.headers[`Authorization`] = `Bearer ` + newToken
        return axiosClient(originalRequest)
      } catch (error) {
        processQueue(error, null)
        setAccessToken(null)
        // window.location.href = `/auth/logout`;
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
