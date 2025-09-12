import React, { useEffect, useState } from 'react'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { IRouter, privateRouter, publicRouter } from './routers/routers'
import DefaultLayout from './layouts/DefaultLayout'
import AuthLayout from './layouts/AuthLayout'
import AuthMiddleware from './middlewares/AuthMiddleware'
import AdminLayout from './layouts/AdminLayout'
import axiosClient from './api/axiosClient'
import { setAccessToken } from './utils/AccessToken'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handleRefreshToken = async () => {
      try {
        const res = await axiosClient.post(
          '/auth/refresh-token',
          {},
          {
            withCredentials: true,
          },
        )
        const result = await res.data
        console.log(result.data.accessToken)
        setAccessToken(result.data.accessToken)
      } catch (error) {
        console.error('Refresh token hết hạn hoặc không hợp lệ:', error)
        setAccessToken(null)
      } finally {
        setReady(true)
      }
    }
    handleRefreshToken()
  }, [])

  if (!ready) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        {publicRouter.map((e: IRouter, index: number) => {
          let Layout: React.ElementType = React.Fragment

          if (e.layout === DefaultLayout) {
            Layout = DefaultLayout
          } else if (e.layout === AuthLayout) {
            Layout = AuthLayout
          }

          const Page = e.Component as React.ElementType

          return (
            <Route key={index} path={e.path} element={<Layout>{Page ? <Page /> : <></>}</Layout>}>
              {e.children &&
                e.children.map((child, k: number) => {
                  const ChildPage = child.Component as React.ElementType
                  return (
                    <Route
                      key={k}
                      path={child.path}
                      index={child.index as boolean}
                      element={<ChildPage />}
                    />
                  )
                })}
            </Route>
          )
        })}

        {privateRouter.map((e: IRouter, index: number) => {
          let Layout: React.ElementType = React.Fragment

          if (e.layout === DefaultLayout) {
            Layout = DefaultLayout
          } else if (e.layout === AuthLayout) {
            Layout = AuthLayout
          } else if (e.layout === AdminLayout) {
            Layout = AdminLayout
          }

          const Page = e.Component as React.ElementType

          return (
            <Route
              key={index}
              path={e.path}
              element={
                <AuthMiddleware>
                  <Layout>{Page ? <Page /> : <></>}</Layout>
                </AuthMiddleware>
              }
            >
              {e.children &&
                e.children.map((child, k: number) => {
                  const ChildPage = child.Component as React.ElementType
                  return (
                    <Route
                      key={k}
                      path={child.path}
                      index={child.index as boolean}
                      element={<ChildPage />}
                    />
                  )
                })}
            </Route>
          )
        })}
      </Routes>
    </BrowserRouter>
  )
}

export default App
