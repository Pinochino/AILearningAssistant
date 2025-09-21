import React from 'react'
import {useCookies} from 'react-cookie';
import { LoginForm } from '../components/auth/LoginForm';

interface IAuthMiddleware {
  children: React.ReactNode
}

const AuthProvider = ({ children }: IAuthMiddleware) => {

  const [cookies] = useCookies(['REFRESH_TOKEN'])

  if (!cookies) {
    return <LoginForm />
  }

  return (
    <div>{children}</div>
  )
}

export default AuthProvider