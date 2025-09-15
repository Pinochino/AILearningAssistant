import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './authReducer'
import { sidebarReducer } from './sidebarReducer'
import { modalReducer } from './diaglogReducer'

const reducers = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  modal: modalReducer,
  
})

export default reducers
