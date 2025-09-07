import React from 'react'
import AuthForm from '../components/ui/auth-form'

const RegisterPage = () => {
  return (
    <div className='flex justify-center items-center h-auto w-[100%]'>
      <AuthForm type='register' />
    </div>
  )
}

export default RegisterPage