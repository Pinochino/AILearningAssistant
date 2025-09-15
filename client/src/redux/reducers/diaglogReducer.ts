import { createSlice } from "@reduxjs/toolkit";

interface IModalSlicer {
  isOpen: boolean;
  content: any
}

const initialState = {
  createUser: {
    isOpen: false,
    content: null
  } as IModalSlicer
} 
const modalSlicer = createSlice({
  name: 'diaglog',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.createUser.isOpen = true
      state.createUser.content = action.payload
    },
    closeModal: (state, action) => {
      state.createUser.isOpen = false
      state.createUser.content = action.payload
    }
  }
})

export const { openModal, closeModal } = modalSlicer.actions;
export const modalReducer = modalSlicer.reducer;



