'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    
    try {
      // Validate email domain
      if (!values.email.endsWith('@fe.edu.vn')) {
        message.error('Vui lòng sử dụng email @fe.edu.vn để đăng nhập');
        setLoading(false);
        return;
      }

      // TODO: Thay thế bằng API call thực tế
      console.log('Login attempt:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Đăng nhập thành công!');
      
      // Redirect based on user role (temporary logic)
      if (values.email.includes('head')) {
        router.push('/head-of-department/dashboard');
      } else {
        router.push('/teacher/dashboard');
      }
      
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 64,
            height: 64,
            background: '#fff5f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <UserOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#ff6b35' }}>
            Đăng nhập
          </Title>
          <Text type="secondary">
            Hệ thống quản lý đề tài khóa luận
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
              { 
                pattern: /@fe\.edu\.vn$/, 
                message: 'Chỉ chấp nhận email @fe.edu.vn!' 
              }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#ff6b35' }} />}
              placeholder="yourname@fe.edu.vn"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#ff6b35' }} />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                background: '#ff6b35',
                borderColor: '#ff6b35',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" style={{ color: '#ff6b35' }}>
              Đăng ký ngay
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/" style={{ color: '#666' }}>
            ← Quay về trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
}
