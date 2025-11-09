import { React } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigation } from "../hooks/useNavigation";

// Dashboard components
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { TeacherDashboard } from "./dashboard/TeacherDashboard";
import { StudentDashboard } from "./dashboard/StudentDashboard";

// Admin pages
import { UserManagement } from "./admin/UserManagement";
import { EditUser } from "./admin/EditUser";
import { SubjectManagement } from "./admin/SubjectManagement";
import { EditSubject } from "./admin/EditSubject";
import { ContentManagement } from "./admin/ContentManagement";
import { SystemSettings } from "./admin/SystemSettings";

// Teacher pages
import { SubjectDetail } from "./teacher/SubjectDetail";
import { Schedule as TeacherSchedule } from "./teacher/Schedule";
import { Messages as TeacherMessages } from "./teacher/Messages";

// Student pages
import { SubjectView } from "./student/SubjectView";
import { SubjectSearch } from "./student/SubjectSearch";
import { Schedule } from "./student/Schedule";
import { AITutor } from "./student/AITutor";
import { DocumentsView } from "./student/DocumentsView";
import { Messages } from "./student/Messages";
import { Achievements } from "./student/Achievements";

// Common pages
import { Profile } from "./Profile";

export function PageRouter() {
  const { user } = useAuth();
  const { currentPage, currentParams } = useNavigation();

  if (!user) return null;

  // Common routes (available for all roles)
  if (currentPage === "profile") {
    return <Profile />;
  }

  // Admin routes
  if (user.role === "admin") {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
      case "all-users":
        return <UserManagement />;
      case "edit-user":
        return <EditUser />;
      case "subjects":
        return <SubjectManagement />;
      case "edit-subject":
        return <EditSubject />;
      case "analytics":
      case "quiz-stats":
      case "flashcard-stats":
      case "learning-progress":
        return <AdminDashboard />; // Change here
      case "content":
        return <ContentManagement />;
      case "gamification":
        return (
          <div className="space-y-6">
            <h1>Gamification</h1>
            <p className="text-muted-foreground">
              Tính năng gamification đang được phát triển...
            </p>
          </div>
        );
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
      case "students":
        return <StudentsManagement />;
      case "content":
      case "documents":
      case "quizzes":
      case "flashcards":
        return <TeacherContentManagement />;
      case "schedule":
        return <TeacherSchedule />;
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
      case "documents":
        return (
          <div className="space-y-6">
            <h1>Học tập</h1>
            <p className="text-muted-foreground">
              Trang học tập đang được phát triển...
            </p>
          </div>
        );
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