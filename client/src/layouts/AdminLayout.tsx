import { Layout, theme } from 'antd'
import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import ASidebar from '../components/common/admin/sidebar/ASidebar'
import AHeader from '../components/common/admin/header/AHeader'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'

interface IAdminLayout {
  children: React.ReactNode
}

const { Content } = Layout

const AdminLayout = ({ children }: IAdminLayout) => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const { user } = useAppSelector((state: RootState) => state.auth.login)
  console.log(user)

  if (!user || !user.role.some((e: string) => e === 'ADMIN' || e === 'SUPER_ADMIN')) {
    return <Navigate to='/forbidden' replace />
  }

  return (
    <Layout className='h-[100vh]'>
      <ASidebar />
      <Layout>
        <AHeader />
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            {children}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
