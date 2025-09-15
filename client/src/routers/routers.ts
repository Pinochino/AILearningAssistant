import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import Dashboard from '@/pages/admin/Dashboard'
import UserManagementPage from '@/pages/admin/UserManagmentPage'
import AuthCallback from '@/pages/auth/AuthCallback'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import LoginPage from '@/pages/auth/LoginPage'
import NewPasswordPage from '@/pages/auth/NewPasswordPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import VerificationOtpPage from '@/pages/auth/VerificationOtpPage'
import HomePage from '@/pages/client/HomePage'
import ForbiddenPage from '@/pages/ForbiddenPage'
import NotFoundPage from '@/pages/NotFoundPage'
import React from 'react'

export interface IRouter {
  path?: string
  Component?: React.ElementType
  index?: boolean
  children?: IRouterChildren[]
  layout?: React.ElementType
}

type IRouterChildren = Pick<IRouter, 'path' | 'index' | 'Component'>

const publicRouter: IRouter[] = [
  {
    path: '/auth',
    layout: AuthLayout,
    children: [
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'verify-otp', Component: VerificationOtpPage },
      { path: 'new-password', Component: NewPasswordPage },
      { path: 'callback', Component: AuthCallback },
    ],
  },
  {
    path: '/forbidden',
    Component: ForbiddenPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]

const privateRouter: IRouter[] = [
  {
    path: '/',
    layout: DefaultLayout,
    children: [{ index: true, Component: HomePage }],
  },
  {
    path: '/admin',
    layout: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'users', Component: UserManagementPage },
    ],
  },
]

export { privateRouter, publicRouter }
