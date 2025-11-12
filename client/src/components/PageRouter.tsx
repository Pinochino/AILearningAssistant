import { useAuth } from '../hooks/useAuth'
import { useNavigation } from '../hooks/useNavigation'

// Dashboard components
import { AdminDashboard } from './dashboard/AdminDashboard'
import { TeacherDashboard } from './dashboard/TeacherDashboard'
import { StudentDashboard } from './dashboard/StudentDashboard'

// Admin pages
import { UserManagement } from './admin/UserManagement'
import {EditUser} from './admin/EditUser'
import { Analytics } from './admin/Analytics'
import { ContentManagement } from './admin/ContentManagement'
import { SystemSettings } from './admin/SystemSettings'
import { ClassManagement } from './admin/ClassManagement'

// Teacher pages
import { StudentsManagement } from './teacher/StudentsManagement'
import { ContentManagement as TeacherContentManagement } from './teacher/ContentManagement'
import { Schedule as TeacherSchedule } from './teacher/Schedule'
import { Messages as TeacherMessages } from './teacher/Messages'
import { Analytics as TeacherAnalytics } from './teacher/Analytics'
import { SubjectDetail } from './teacher/SubjectDetail'

// Student pages
import { Schedule } from './student/Schedule'
import { AITutor } from './student/AITutor'
import { DocumentsView } from './student/DocumentsView'
import { Messages } from './student/Messages'
import { Achievements } from './student/Achievements'
import { SubjectSearch } from './student/SubjectSearch'
import { SubjectView } from './student/SubjectView'

// Common pages
import { Profile } from './Profile'

export function PageRouter() {
  const { currentPage, currentParams } = useNavigation()
  const { user } = useAuth()

  if (!user) return null

  // Get user role (admin, teacher, or student)
  const userRole = user.role

  // Common routes (available for all roles)
  if (currentPage === 'profile') {
    return <Profile />
  }

  // Admin routes
  if (userRole === 'admin') {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />
      case 'users':
      case 'all-users':
        return <UserManagement />
      case 'edit-user':
        return <EditUser />
      case 'subjects':
        return (
          <div className='space-y-6'>
            <h1>Quản lý Môn học</h1>
            <p className='text-muted-foreground'>Tính năng quản lý môn học đang được phát triển...</p>
          </div>
        )
      case 'edit-subject':
        return (
          <div className='space-y-6'>
            <h1>Chỉnh sửa Môn học</h1>
            <p className='text-muted-foreground'>Tính năng chỉnh sửa môn học đang được phát triển...</p>
          </div>
        )
      case 'classes':
      case 'class-management':
        return <ClassManagement />
      case 'analytics':
        return <Analytics />
      case 'quiz-stats':
      case 'flashcard-stats':
      case 'learning-progress':
        return <Analytics />
      case 'content':
        return <ContentManagement />
      case 'settings':
        return <SystemSettings />
      default:
        return <AdminDashboard />
    }
  }

  // Teacher routes
  if (userRole === 'teacher') {
    switch (currentPage) {
      case 'dashboard':
        return <TeacherDashboard />
      case 'subjects':
        return <SubjectDetail />
      case 'students':
        return <StudentsManagement />
      case 'content':
      case 'documents':
      case 'quizzes':
      case 'flashcards':
        return <TeacherContentManagement />
      case 'schedule':
        return <TeacherSchedule />
      case 'messages':
        return <TeacherMessages />
      default:
        return <TeacherDashboard />
    }
  }

  // Student routes
  if (userRole === 'student') {
    switch (currentPage) {
      case 'dashboard':
        return <StudentDashboard />
      case 'subjects':
        return <SubjectView />
      case 'subject-search':
        return <SubjectSearch />
      case 'schedule':
        return <Schedule />
      case 'study':
      case 'quizzes':
      case 'flashcards':
      case 'documents':
        return (
          <div className='space-y-6'>
            <h1>Học tập</h1>
            <p className='text-muted-foreground'>Trang học tập đang được phát triển...</p>
          </div>
        )
      case 'ai-tutor':
        return <AITutor />
      case 'documents':
        return <DocumentsView />
      case 'messages':
        return <Messages />
      case 'achievements':
        return <Achievements />
      default:
        return <StudentDashboard />
    }
  }

  return <div>Page not found</div>
}
