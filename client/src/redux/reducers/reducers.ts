import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './authReducer'
import { sidebarReducer } from './sidebarReducer'

const reducers = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer
})

export default reducers
