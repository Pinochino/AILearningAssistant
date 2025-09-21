// import { useAuth, AuthProvider } from './hooks/useAuth'
import { NavigationProvider } from './hooks/useNavigation'
import { LoginForm } from './components/auth/LoginForm'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { PageRouter } from './components/PageRouter'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { persistor, RootState, store } from './redux/store'
import AuthProvider from './middlewares/AuthMiddleware'
import { useAppSelector } from './redux/hooks'
import { CookiesProvider } from 'react-cookie'
import { PersistGate } from 'redux-persist/integration/react'
import axiosClient, { setAccessToken } from './api/axiosClient'

function AppContent() {
  // const { user, isLoading } = useAuth()

  const { loading, error, user } = useAppSelector((state: RootState) => state.auth.login)

  if (loading === 'pending') {
    return (
      <div className='size-full flex items-center justify-center'>
        <div className='text-center space-y-2'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='text-muted-foreground'>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <NavigationProvider>
      <DashboardLayout>
        <PageRouter />
      </DashboardLayout>
    </NavigationProvider>
  )
}

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools
  }))
)

export default function App() {
  const queryClient = new QueryClient()

  const [showDevtools, setShowDevtools] = React.useState(false)

  React.useEffect(() => {
    // @ts-expect-error
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])
useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axiosClient.post('/auth/refresh-token', {}, { withCredentials: true })
        const newToken = res.data?.data?.accessToken
        if (newToken) {
          setAccessToken(newToken)
          console.log("🔑 Token restored on app load:", newToken)
        }
      } catch (err) {
        console.log("❌ Refresh failed:", err)
      }
    }
    initAuth()
  }, [])
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CookiesProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {/* The rest of your application */}
              <ReactQueryDevtools initialIsOpen={false} />
              <AppContent />
            </AuthProvider>
            {showDevtools && (
              <React.Suspense fallback={null}>
                <ReactQueryDevtoolsProduction />
              </React.Suspense>
            )}
          </QueryClientProvider>
        </CookiesProvider>
      </PersistGate>
    </Provider>
  )
}
