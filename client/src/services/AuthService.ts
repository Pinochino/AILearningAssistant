import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
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
      const result = res.data

      if (res.status < 200 || res.status > 300) {
        return rejectWithValue(res.statusText)
      }

      return result
    } catch (error) {
      rejectWithValue(error)
    }
  }),
  logout: createAsyncThunk(authUrls.logout, async (_, { rejectWithValue }) => {
    try {
      const res = await handleApi({ url: authUrls.logout, method: 'POST', withCredentials: true })
      const result = res.data

      if (res.status < 200 || res.status > 300) {
        return rejectWithValue(res.statusText)
      }

      return result
    } catch (error) {
      rejectWithValue(error)
    }
  }),

}

export default authService
