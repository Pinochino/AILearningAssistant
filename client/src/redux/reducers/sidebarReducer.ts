import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ISidebarSlice {
    sidebarToggle: boolean;
}

const initialState: ISidebarSlice = {
    sidebarToggle: false,
}

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleSidebar: (state, action: PayloadAction<boolean>) => {
            state.sidebarToggle = !action.payload;
        }
    }
})

export const { toggleSidebar } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;

