import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Scenes } from '@/pages/Scenes'
import { Agents } from '@/pages/Agents'
import { Simulation } from '@/pages/Simulation'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
    ],
  },
])
