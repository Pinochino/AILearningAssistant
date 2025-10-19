import { createAsyncThunk } from '@reduxjs/toolkit'
import { authUrls } from '../data/AuthUrls'
import { handleApi } from '../api/handleApi'

interface LoginType {
  email: string
  password: string
}

const authService = {
  login: createAsyncThunk(authUrls.login, async (data: LoginType, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.login, method: 'POST', data, withCredentials: true })
      const result = (res as any).data
      if ((res as any).status < 200 || (res as any).status > 300) {
        return rejectWithValue((res as any).statusText)
      }
      return result
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Login failed')
    }
  }),
  logout: createAsyncThunk(authUrls.logout, async (_, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.logout, method: 'POST', withCredentials: true })
      const result = (res as any).data
      if ((res as any).status < 200 || (res as any).status > 300) {
        return rejectWithValue((res as any).statusText)
      }
      return result
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Logout failed')
    }
  }),
}

export default authService
