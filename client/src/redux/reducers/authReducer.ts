import { createSlice } from "@reduxjs/toolkit"
import type { UserInterface } from "../../types/UserInterface.js";

interface IAuthSlice {
    user: UserInterface | null,
    loading: 'idle' | 'pending' | 'success' | 'failed',
    error: string | null
}

const initialState = {
    login: {
        user: null,
        loading: 'idle',
        error: null
    } as IAuthSlice
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: builder => {
    }
})


export const authReducer = authSlice.reducer;