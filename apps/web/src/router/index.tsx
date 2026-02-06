import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Scenes } from '@/pages/Scenes'
import { Agents } from '@/pages/Agents'
import { Simulation } from '@/pages/Simulation'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { Users } from '@/pages/Users'
import { useAuthStore } from '@/stores/auth.store'

// 路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// 公开路由
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'scenes',
        element: <Scenes />,
      },
      {
        path: 'agents',
        element: <Agents />,
      },
      {
        path: 'simulation',
        element: <Simulation />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'users',
        element: <Users />,
      },
    ],
  },
])
