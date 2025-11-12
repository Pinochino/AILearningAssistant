import { useAuth } from '../hooks/useAuth'
import { useNavigation } from '../hooks/useNavigation'

// Dashboard components
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { TeacherDashboard } from "./dashboard/TeacherDashboard";
import { StudentDashboard } from "./dashboard/StudentDashboard";

// Admin pages
import { UserManagement } from './admin/UserManagement'
import { EditUser } from './admin/EditUser'
import { ClassManagement } from './admin/ClassManagement'
import { ContentManagement } from './admin/ContentManagement'
import { SystemSettings } from './admin/SystemSettings'
import { UserDetailPage } from './admin/UserDetail'

// Teacher pages
import { SubjectDetail } from './teacher/SubjectDetail'
import { Messages as TeacherMessages } from './teacher/Messages'

// Student pages
import { SubjectView } from './student/SubjectView'
import { SubjectSearch } from './student/SubjectSearch'
import { Schedule } from './student/Schedule'
import { AITutor } from './student/AITutor'
import { DocumentsView } from './student/DocumentsView'
import { Messages } from './student/Messages'

// Common pages
import { Profile } from './Profile'

export function PageRouter() {
  const { currentPage, currentParams } = useNavigation()
  const { user } = useAuth()

  if (!user) return null

  // Get user role (admin, teacher, or student)
  const userRole = user.role

  // Common routes (available for all roles)
  if (currentPage === "profile") {
    return <Profile />;
  }

  // Admin routes
  if (user.role === "admin") {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />
      case 'users':
      case 'all-users':
        return <UserManagement />
      case 'edit-user':
        return <EditUser />
      case 'user-detail':
        return <UserDetailPage />
      case 'classes':
        return <ClassManagement />
      case 'edit-subject':
      case 'analytics':
      case 'quiz-stats':
      case 'flashcard-stats':
      case 'learning-progress':
        return <AdminDashboard /> // Change here
      case 'content':
        return <ContentManagement />;
      case "settings":
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  }

  // Teacher routes
  if (user.role === "teacher") {
    switch (currentPage) {
      case "dashboard":
        return <TeacherDashboard />;
      case "subjects":
        return <SubjectDetail />;
      case "content":
      case "documents":
      case "quizzes":
      case "flashcards":
        return <TeacherDashboard />;
      case "schedule":
      case "messages":
        return <TeacherMessages />;
      default:
        return <TeacherDashboard />;
    }
  }

  // Student routes
  if (user.role === "student") {
    switch (currentPage) {
      case "dashboard":
        return <StudentDashboard />;
      case "subjects":
        return <SubjectView />;
      case "subject-search":
        return <SubjectSearch />;
      case "schedule":
        return <Schedule />;
      case "study":
      case "quizzes":
      case "flashcards":
      case "ai-tutor":
        return <AITutor />;
      case "documents":
        return <DocumentsView />;
      case "messages":
        return <Messages />;
      default:
        return <StudentDashboard />;
    }
  }

  return <div>Page not found</div>;
}