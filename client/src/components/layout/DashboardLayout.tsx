import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminSidebar } from './sidebars/AdminSidebar';
import { TeacherSidebar } from './sidebars/TeacherSidebar';
import { StudentSidebar } from './sidebars/StudentSidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSidebar = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return <AdminSidebar isOpen={sidebarOpen} />;
      case 'teacher':
        return <TeacherSidebar isOpen={sidebarOpen} />;
      case 'student':
        return <StudentSidebar isOpen={sidebarOpen} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {renderSidebar()}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}