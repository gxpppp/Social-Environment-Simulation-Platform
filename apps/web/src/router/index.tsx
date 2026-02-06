import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { MainLayout } from '@/layouts/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { useAuthStore } from '@/stores/auth.store'

// 懒加载页面组件
const Scenes = lazy(() => import('@/pages/Scenes').then(m => ({ default: m.Scenes })))
const Agents = lazy(() => import('@/pages/Agents').then(m => ({ default: m.Agents })))
const Simulation = lazy(() => import('@/pages/Simulation').then(m => ({ default: m.Simulation })))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Settings = lazy(() => import('@/pages/Settings'))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Users = lazy(() => import('@/pages/Users').then(m => ({ default: m.Users })))

// 加载中组件
const PageLoading = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <Spin size="large" />
    <span style={{ marginTop: 16, color: '#999' }}>页面加载中...</span>
  </div>
)

// 懒加载包装器
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
)

// 路由守卫组件
const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// 公开路由
const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Login />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'scenes',
            element: (
              <LazyWrapper>
                <Scenes />
              </LazyWrapper>
            ),
          },
          {
            path: 'agents',
            element: (
              <LazyWrapper>
                <Agents />
              </LazyWrapper>
            ),
          },
          {
            path: 'simulation',
            element: (
              <LazyWrapper>
                <Simulation />
              </LazyWrapper>
            ),
          },
          {
            path: 'analytics',
            element: (
              <LazyWrapper>
                <Analytics />
              </LazyWrapper>
            ),
          },
          {
            path: 'settings',
            element: (
              <LazyWrapper>
                <Settings />
              </LazyWrapper>
            ),
          },
          {
            path: 'users',
            element: (
              <LazyWrapper>
                <Users />
              </LazyWrapper>
            ),
          },
        ],
      },
    ],
  },
])
