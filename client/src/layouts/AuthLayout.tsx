import React from 'react'
import { Outlet } from 'react-router-dom'

interface IAuthLayout {
  children: React.ReactNode
}

const AuthLayout = ({ children }: IAuthLayout) => {
  return (
    <div className='h-[100vh] flex justify-center items-center'>
      {children}
      <Outlet />
    </div>
  )
}

export default AuthLayout
