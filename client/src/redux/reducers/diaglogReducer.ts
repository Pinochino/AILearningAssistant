import { createSlice } from "@reduxjs/toolkit";
import { FormInstance } from "antd";
import { stat } from "fs";

type modalSlicerType = 'createUser' | 'updateUser'

interface IModalSlicer<T> {
  isOpen: boolean;
  title: string ;
  modalType: modalSlicerType | null
  pathApi: string | null

}

const initialState = {
  createUser: {
    isOpen: false,
    title: '',
    modalType: null,
    pathApi: null
  } as IModalSlicer<any>
}
const modalSlicer = createSlice({
  name: 'diaglog',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.createUser.isOpen = true
      state.createUser.title = action.payload.title ?? null
      state.createUser.modalType = action.payload.modalType ?? null
      state.createUser.pathApi = action.payload.pathApi ?? null
    },
    closeModal: (state) => {
      state.createUser.isOpen = false
      state.createUser.title = ''
      state.createUser.modalType = null
      state.createUser.pathApi = null
    }
  }
})

export const { openModal, closeModal } = modalSlicer.actions;
export const modalReducer = modalSlicer.reducer;



