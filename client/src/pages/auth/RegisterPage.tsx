import AuthForm from '@/components/ui/forms/auth-form'
import React from 'react'

const RegisterPage = () => {
  return (
    <div className="flex justify-center items-center h-auto w-[100%]">
      <AuthForm type="register" />
    </div>
  )
}

export default RegisterPage
