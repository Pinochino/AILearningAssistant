import { createAsyncThunk } from '@reduxjs/toolkit'
import { authUrls } from '../constant/AuthUrls'
import { LoginType, RegisterType } from '../types/UserInterface'
import handleApi from '../api/handleApi'
import { setAccessToken } from '../utils/AccessToken'

const authService = {
  login: createAsyncThunk(authUrls.login, async (data: LoginType, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.login, method: 'POST', data, withCredentials: true })
      const result = await res.data
      setAccessToken(result.accessToken)

      if (res.status < 200 || res.status > 300) {
        return rejectWithValue(res.statusText)
      }

      return result
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }),
  register: createAsyncThunk(authUrls.register, async (data: RegisterType, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.register, method: 'POST', data, withCredentials: true })
      const result = await res.data
      setAccessToken(result.accessToken)

      if (res.status < 200 || res.status > 300) {
        return rejectWithValue(res.statusText)
      }

      return result
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }),
  logout: createAsyncThunk(authUrls.logout, async (_, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.logout, method: 'POST', withCredentials: true })
      const result = await res.data

      if (res.status < 200 || res.status > 300) {
        return rejectWithValue(res.statusText)
      }

      setAccessToken(null)

      return result
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }),
  sendOtp: async (email: string) => {
    try {
      const res = await handleApi({ url: authUrls.sendOtp, data: email, method: 'POST' })

      if (res.status < 200 || res.status > 300) {
        throw new Error(res.statusText)
      }

      const data = await res.data
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  forgotPassword: async (otp: string, newPassword: string) => {
    try {
      const res = await handleApi({ url: authUrls.fotgotPassword, method: 'POST', data: { otp, newPassword } })

      if (res.status < 200 || res.status > 300) {
        throw new Error(res.statusText)
      }

      const data = await res.data
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export default authService
