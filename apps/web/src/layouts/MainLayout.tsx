import React from 'react'
import { Layout, Menu, theme, Avatar, Dropdown, Space, Badge } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { CanManageUsers } from '@/components/Permission'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '工作台',
  },
  {
    key: '/scenes',
    icon: <AppstoreOutlined />,
    label: '场景管理',
  },
  {
    key: '/agents',
    icon: <TeamOutlined />,
    label: '角色管理',
  },
  {
    key: '/simulation',
    icon: <PlayCircleOutlined />,
    label: '模拟控制',
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: '分析中心',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
]

export const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isRole } = useAuthStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    ...(isRole('admin')
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户管理',
          },
        ]
      : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    } else if (key === 'profile') {
      navigate('/settings')
    } else {
      navigate(key)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible theme="light">
        <div
          style={{
            height: 64,
            padding: 16,
            fontSize: 18,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          SESP 模拟平台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            社会环境模拟与演化分析系统
          </div>
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.avatar} icon={<UserOutlined />} size="small" />
              <span>{user?.username}</span>
              <Badge
                status={user?.role === 'admin' ? 'error' : 'success'}
                text={
                  user?.role === 'admin'
                    ? '管理员'
                    : user?.role === 'user'
                    ? '用户'
                    : '访客'
                }
                style={{ marginLeft: 8 }}
              />
              <DownOutlined style={{ fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
