import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/stores/auth.store';
import { authApi } from '@/services/auth.service';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      // 调用后端登录API
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      // 构造用户信息
      const user = {
        id: response.user.id,
        username: response.user.name || response.user.email.split('@')[0],
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
        permissions: [],
        createdAt: new Date().toISOString(),
      };

      // 保存登录状态
      login(user, response.access_token, response.access_token);

      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          maxWidth: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <SafetyOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            SESP 模拟平台
          </Title>
          <Text type="secondary">社会环境模拟与演化分析系统</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a href="#">忘记密码?</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>测试账号</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            管理员: admin@sesp.com / admin123
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            需要先注册账号
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
