import { useAuth, AuthProvider } from './hooks/useAuth';
import { NavigationProvider } from './hooks/useNavigation';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PageRouter } from './components/PageRouter';
import { Toaster } from './components/ui/sonner';
import Spinner from './components/layout/spinner/Spinner';

function AppContent() {
  const { user, isLoading } = useAuth();

if (isLoading) {
  return (
    <Spinner />
  );
}

  if (!user) {
    return <LoginForm />;
  }

  return (
    <NavigationProvider>
      <DashboardLayout>
        <PageRouter />
      </DashboardLayout>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}