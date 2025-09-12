import React, { useEffect } from 'react'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import { Navigate, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../utils/AccessToken'

interface IAuthMiddleware {
  children: React.ReactNode
}

const AuthMiddleware = ({ children }: IAuthMiddleware) => {
  const accessToken = getAccessToken()
  if (!accessToken) {
    return <Navigate to='/auth/login' replace />
  }

  return <>{children}</>
}

export default AuthMiddleware
