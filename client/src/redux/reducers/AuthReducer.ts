import { createSlice } from '@reduxjs/toolkit'
import authService from '../../services/AuthService'
import { UserInterface } from '../../types/UserInterface'

interface IAuthSlice {
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
  user: any | null
}

const initialState = {
  login: {
    loading: 'idle',
    user: null,
    error: null
  } as IAuthSlice,
  logout: {
    user: null,
    loading: 'idle',
    error: null
  } as IAuthSlice
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(authService.login.pending, (state) => {
      state.login.loading = 'pending'
    })
    builder.addCase(authService.login.fulfilled, (state, action) => {
      state.login.loading = 'succeeded'
      state.login.user = action.payload
    })
    builder.addCase(authService.login.rejected, (state, action) => {
      state.login.loading = 'failed'
      state.login.error = action.error.message as string
    })
     builder.addCase(authService.logout.pending, (state) => {
      state.logout.loading = 'pending'
    })
    builder.addCase(authService.logout.fulfilled, (state) => {
      state.logout.loading = 'succeeded'
      state.login.user = null
    })
    builder.addCase(authService.logout.rejected, (state, action) => {
      state.logout.loading = 'failed'
      state.logout.error = action.error.message as string
    })
  }
})

export const authReducer = authSlice.reducer
