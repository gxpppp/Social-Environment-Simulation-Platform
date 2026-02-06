import React from 'react';
import { useAuthStore, Permission } from '@/stores/auth.store';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

// 权限控制组件属性
interface PermissionGuardProps {
  // 需要的权限
  permission?: Permission;
  // 需要的任意权限
  anyPermission?: Permission[];
  // 需要的所有权限
  allPermissions?: Permission[];
  // 需要的角色
  role?: 'admin' | 'user' | 'guest';
  // 无权限时显示的内容
  fallback?: React.ReactNode;
  // 子元素
  children: React.ReactNode;
}

// 权限守卫组件
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  anyPermission,
  allPermissions,
  role,
  fallback,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isRole } = useAuthStore();

  // 检查权限
  const checkPermission = (): boolean => {
    // 如果指定了具体权限
    if (permission && !hasPermission(permission)) {
      return false;
    }

    // 如果指定了任意权限
    if (anyPermission && !hasAnyPermission(anyPermission)) {
      return false;
    }

    // 如果指定了所有权限
    if (allPermissions && !hasAllPermissions(allPermissions)) {
      return false;
    }

    // 如果指定了角色
    if (role && !isRole(role)) {
      return false;
    }

    return true;
  };

  // 有权限则显示子元素
  if (checkPermission()) {
    return <>{children}</>;
  }

  // 无权限时显示fallback或默认提示
  if (fallback) {
    return <>{fallback}</>;
  }

  // 默认无权限提示
  return (
    <Result
      icon={<LockOutlined />}
      title="无权限访问"
      subTitle="您没有权限执行此操作，请联系管理员"
      extra={
        <Button type="primary" onClick={() => window.history.back()}>
          返回
        </Button>
      }
    />
  );
};

// 便捷权限组件
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const UserOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <PermissionGuard anyPermission={['scene:create', 'agent:create']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// 场景权限组件
export const CanCreateScene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="scene:create">{children}</PermissionGuard>
);

export const CanUpdateScene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="scene:update">{children}</PermissionGuard>
);

export const CanDeleteScene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="scene:delete">{children}</PermissionGuard>
);

// Agent权限组件
export const CanCreateAgent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="agent:create">{children}</PermissionGuard>
);

export const CanUpdateAgent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="agent:update">{children}</PermissionGuard>
);

export const CanDeleteAgent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="agent:delete">{children}</PermissionGuard>
);

// 模拟权限组件
export const CanStartSimulation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="simulation:start">{children}</PermissionGuard>
);

export const CanStopSimulation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="simulation:stop">{children}</PermissionGuard>
);

// 分析权限组件
export const CanExportAnalytics: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="analytics:export">{children}</PermissionGuard>
);

// 管理权限组件
export const CanManageUsers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="user:manage">{children}</PermissionGuard>
);

export const CanManageSettings: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="settings:manage">{children}</PermissionGuard>
);

export default PermissionGuard;
