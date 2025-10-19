import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './AuthReducer'

export const reducers = combineReducers({
  auth: authReducer,
})
