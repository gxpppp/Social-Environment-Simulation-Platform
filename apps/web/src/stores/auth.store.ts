import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户角色类型
export type UserRole = 'admin' | 'user' | 'guest';

// 权限类型
export type Permission = 
  | 'scene:create' | 'scene:read' | 'scene:update' | 'scene:delete'
  | 'agent:create' | 'agent:read' | 'agent:update' | 'agent:delete'
  | 'simulation:start' | 'simulation:stop' | 'simulation:read'
  | 'analytics:read' | 'analytics:export'
  | 'user:manage' | 'settings:manage';

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
  createdAt: string;
  lastLoginAt?: string;
}

// 认证状态接口
interface AuthState {
  // 当前用户
  user: User | null;
  // 是否已认证
  isAuthenticated: boolean;
  // 认证令牌
  token: string | null;
  // 刷新令牌
  refreshToken: string | null;
  // 登录时间
  loginAt: string | null;
  
  // 操作方法
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateToken: (token: string) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole) => boolean;
}

// 角色权限映射
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'scene:create', 'scene:read', 'scene:update', 'scene:delete',
    'agent:create', 'agent:read', 'agent:update', 'agent:delete',
    'simulation:start', 'simulation:stop', 'simulation:read',
    'analytics:read', 'analytics:export',
    'user:manage', 'settings:manage',
  ],
  user: [
    'scene:create', 'scene:read', 'scene:update', 'scene:delete',
    'agent:create', 'agent:read', 'agent:update', 'agent:delete',
    'simulation:start', 'simulation:stop', 'simulation:read',
    'analytics:read', 'analytics:export',
  ],
  guest: [
    'scene:read',
    'agent:read',
    'simulation:read',
    'analytics:read',
  ],
};

// 创建认证store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      loginAt: null,

      // 登录
      login: (user, token, refreshToken) => {
        // 合并角色权限
        const permissions = [
          ...rolePermissions[user.role],
          ...(user.permissions || []),
        ];
        
        set({
          user: { ...user, permissions },
          isAuthenticated: true,
          token,
          refreshToken,
          loginAt: new Date().toISOString(),
        });
      },

      // 登出
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          loginAt: null,
        });
      },

      // 更新用户信息
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          // 如果角色改变，更新权限
          let permissions = currentUser.permissions;
          if (userData.role && userData.role !== currentUser.role) {
            permissions = [
              ...rolePermissions[userData.role],
              ...(userData.permissions || []),
            ];
          }
          
          set({
            user: { ...currentUser, ...userData, permissions },
          });
        }
      },

      // 更新令牌
      updateToken: (token) => {
        set({ token });
      },

      // 检查是否有指定权限
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      // 检查是否有任意一个权限
      hasAnyPermission: (permissions) => {
        const user = get().user;
        if (!user) return false;
        return permissions.some((p) => user.permissions.includes(p));
      },

      // 检查是否拥有所有权限
      hasAllPermissions: (permissions) => {
        const user = get().user;
        if (!user) return false;
        return permissions.every((p) => user.permissions.includes(p));
      },

      // 检查是否是指定角色
      isRole: (role) => {
        const user = get().user;
        if (!user) return false;
        return user.role === role;
      },
    }),
    {
      name: 'sesp-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        loginAt: state.loginAt,
      }),
    }
  )
);

// 权限检查Hook
export const usePermission = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isRole } = useAuthStore();
  
  return {
    canCreateScene: () => hasPermission('scene:create'),
    canReadScene: () => hasPermission('scene:read'),
    canUpdateScene: () => hasPermission('scene:update'),
    canDeleteScene: () => hasPermission('scene:delete'),
    
    canCreateAgent: () => hasPermission('agent:create'),
    canReadAgent: () => hasPermission('agent:read'),
    canUpdateAgent: () => hasPermission('agent:update'),
    canDeleteAgent: () => hasPermission('agent:delete'),
    
    canStartSimulation: () => hasPermission('simulation:start'),
    canStopSimulation: () => hasPermission('simulation:stop'),
    canReadSimulation: () => hasPermission('simulation:read'),
    
    canReadAnalytics: () => hasPermission('analytics:read'),
    canExportAnalytics: () => hasPermission('analytics:export'),
    
    canManageUsers: () => hasPermission('user:manage'),
    canManageSettings: () => hasPermission('settings:manage'),
    
    isAdmin: () => isRole('admin'),
    isUser: () => isRole('user'),
    isGuest: () => isRole('guest'),
    
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useAuthStore;
