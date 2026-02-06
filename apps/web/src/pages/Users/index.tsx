import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Avatar,
  Typography,
  message,
  Popconfirm,
  Badge,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuthStore, User, UserRole } from '@/stores/auth.store';
import { CanManageUsers } from '@/components/Permission';

const { Title, Text } = Typography;
const { Option } = Select;

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@sesp.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    username: 'researcher1',
    email: 'researcher1@sesp.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=researcher1',
    permissions: [],
    createdAt: '2024-01-05T00:00:00Z',
    lastLoginAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    username: 'guest1',
    email: 'guest1@sesp.com',
    role: 'guest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest1',
    permissions: [],
    createdAt: '2024-01-10T00:00:00Z',
  },
];

// 角色配置
const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { label: '管理员', color: 'red', icon: <LockOutlined /> },
  user: { label: '普通用户', color: 'blue', icon: <UserOutlined /> },
  guest: { label: '访客', color: 'default', icon: <TeamOutlined /> },
};

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user: currentUser } = useAuthStore();

  // 表格列定义
  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.username}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={roleConfig[role].color} icon={roleConfig[role].icon}>
          {roleConfig[role].label}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (record: User) => (
        <Badge
          status={record.lastLoginAt ? 'success' : 'default'}
          text={record.lastLoginAt ? '活跃' : '未登录'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : '从未登录',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.id === currentUser?.id}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此用户吗？"
            onConfirm={() => handleDelete(record.id)}
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 打开新增模态框
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setModalVisible(true);
  };

  // 删除用户
  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    message.success('用户已删除');
  };

  // 保存用户
  const handleSave = (values: any) => {
    if (editingUser) {
      // 更新现有用户
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...values }
            : u
        )
      );
      message.success('用户已更新');
    } else {
      // 创建新用户
      const newUser: User = {
        id: Date.now().toString(),
        ...values,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
        permissions: [],
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      message.success('用户已创建');
    }
    setModalVisible(false);
  };

  return (
    <CanManageUsers>
      <div style={{ padding: 24 }}>
        <Card
          title={
            <Space>
              <TeamOutlined />
              <Title level={4} style={{ margin: 0 }}>
                用户管理
              </Title>
            </Space>
          }
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增用户
            </Button>
          }
        >
          {/* 统计信息 */}
          <Space style={{ marginBottom: 16 }}>
            <Badge count={`总计: ${users.length}`} style={{ backgroundColor: '#1890ff' }} />
            <Badge
              count={`管理员: ${users.filter((u) => u.role === 'admin').length}`}
              style={{ backgroundColor: '#f5222d' }}
            />
            <Badge
              count={`普通用户: ${users.filter((u) => u.role === 'user').length}`}
              style={{ backgroundColor: '#1890ff' }}
            />
            <Badge
              count={`访客: ${users.filter((u) => u.role === 'guest').length}`}
              style={{ backgroundColor: '#d9d9d9' }}
            />
          </Space>

          {/* 用户表格 */}
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* 用户编辑模态框 */}
        <Modal
          title={editingUser ? '编辑用户' : '新增用户'}
          visible={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => setModalVisible(false)}
          okText="保存"
          cancelText="取消"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            )}

            <Form.Item
              label="角色"
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
              initialValue="user"
            >
              <Select placeholder="请选择角色">
                <Option value="admin">
                  <Space>
                    <LockOutlined />
                    管理员
                  </Space>
                </Option>
                <Option value="user">
                  <Space>
                    <UserOutlined />
                    普通用户
                  </Space>
                </Option>
                <Option value="guest">
                  <Space>
                    <TeamOutlined />
                    访客
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CanManageUsers>
  );
};

export default Users;
