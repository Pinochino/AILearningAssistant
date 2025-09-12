import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Layout, theme } from 'antd'
import React from 'react'
import { useDispatch } from 'react-redux'
import { toggleSidebar } from '@/redux/reducers/sidebarReducer'
import { RootState } from '@/redux/store'
import { useAppSelector } from '@/redux/hooks'

const { Header } = Layout
const AHeader = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const dispatch = useDispatch()
  const { sidebarToggle } = useAppSelector((state: RootState) => state.sidebar)

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar(sidebarToggle))
  }

  return (
    <Header style={{ background: colorBgContainer }}>
      <Button
        type="text"
        icon={sidebarToggle ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={handleToggleSidebar}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />
    </Header>
  )
}

export default AHeader
