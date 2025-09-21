import { useState } from 'react'
// import { useAuth } from '../../hooks/useAuth'
import { AdminSidebar } from './sidebars/AdminSidebar'
import { TeacherSidebar } from './sidebars/TeacherSidebar'
import { StudentSidebar } from './sidebars/StudentSidebar'
import { Header } from './Header'
import { useAppSelector } from '../../redux/hooks'
import { RootState } from '../../redux/store'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAppSelector((state: RootState) => state.auth.login)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const roles = user.data.user.role
  console.log('dashboard: ', roles)


  const renderSidebar = () => {
    if (!user) return null

    if (roles.includes('SUPER_ADMIN')) {
    return <AdminSidebar isOpen={sidebarOpen} />
  }
  if (roles.includes('TEACHER')) {
    return <TeacherSidebar isOpen={sidebarOpen} />
  }
  if (roles.includes('STUDENT')) {
    return <StudentSidebar isOpen={sidebarOpen} />
  }

  return null
  }

  return (
    <div className='flex h-screen bg-background'>
      {renderSidebar()}

      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
