import { createSlice } from '@reduxjs/toolkit'
import type { UserInterface } from '../../types/UserInterface.js'
import authService from '../../services/AuthService.js'
import { PayloadAction } from '@reduxjs/toolkit'

interface IAuthSlice {
  user: any | null
  loading: 'idle' | 'pending' | 'success' | 'failed'
  error: string | null
}

const initialState = {
  login: {
    user: null,
    loading: 'idle',
    error: null,
  } as IAuthSlice,
  register: {
    user: null,
    loading: 'idle',
    error: null,
  } as IAuthSlice,
  logout: {
    loading: 'idle',
    error: null,
  } as IAuthSlice,
  loginWithGoogle: {
    loading: 'idle',
    error: null,
    user: null,
  } as IAuthSlice
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authService.login.pending, (state) => {
        state.login.loading = 'pending'
      })
      .addCase(authService.login.fulfilled, (state, action) => {
        state.login.loading = 'success'
        state.login.user = action.payload.data.user
      })
      .addCase(authService.login.rejected, (state, action) => {
        state.login.loading = 'failed'
        state.login.error = action.error.message as string
      })
      .addCase(authService.register.pending, (state) => {
        state.register.loading = 'pending'
      })
      .addCase(authService.register.fulfilled, (state, action) => {
        state.register.loading = 'success'
        state.register.user = action.payload
      })
      .addCase(authService.register.rejected, (state, action) => {
        state.register.loading = 'failed';
        state.register.error = action.error.message as string;
      })
      .addCase(authService.logout.pending, (state) => {
        state.logout.loading = 'pending'
      })
      .addCase(authService.logout.fulfilled, (state) => {
        state.logout.loading = 'success'
        state.login.user = null
        state.loginWithGoogle.user = null
      })
      .addCase(authService.logout.rejected, (state, action) => {
        state.logout.loading = 'failed'
        state.logout.error = action.error.message as string
      })
   

  },
})

export const authReducer = authSlice.reducer
