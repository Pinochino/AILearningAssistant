import React from 'react'
import AuthForm from '../../components/ui/forms/auth-form'

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center h-auto w-[100%]">
      <AuthForm type="login" />
    </div>
  )
}

export default LoginPage
