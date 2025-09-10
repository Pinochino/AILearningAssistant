import { createAsyncThunk } from "@reduxjs/toolkit";
import { authUrls } from "../constant/AuthUrls";
import { LoginType } from "../types/UserInterface";
import handleApi from "../api/handleApi";
import { setAccessToken } from "../utils/AccessToken";

const authService = {
    login: createAsyncThunk(authUrls.login, async (data: LoginType, { rejectWithValue }) => {
        try {
            const res = await handleApi({ url: authUrls.login, method: 'POST', data, withCredentials: true })
            const result = await res.data;
            setAccessToken(result.accessToken);

            if (res.status < 200 || res.status > 300) {
                return rejectWithValue(res.statusText);
            }

            return result;
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }),
    logout: createAsyncThunk(authUrls.logout, async (_, { rejectWithValue }) => {
        try {
            const res = await handleApi({ url: authUrls.logout, method: 'POST',  withCredentials: true })
            const result = await res.data;

            if (res.status < 200 || res.status > 300) {
                return rejectWithValue(res.statusText);
            }

            setAccessToken(null);

            return result;
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    })
}

export default authService;