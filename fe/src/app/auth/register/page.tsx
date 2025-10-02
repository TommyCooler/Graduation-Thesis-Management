'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      // Validate email domain
      if (!values.email.endsWith('@fe.edu.vn')) {
        message.error('Vui lòng sử dụng email @fe.edu.vn để đăng ký');
        setLoading(false);
        return;
      }

      // TODO: Thay thế bằng API call thực tế
      console.log('Register attempt:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/auth/login');
      
    } catch (error) {
      message.error('Đăng ký thất bại. Vui lòng thử lại.');
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
          maxWidth: 450,
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
            <UserAddOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#ff6b35' }}>
            Đăng ký
          </Title>
          <Text type="secondary">
            Tạo tài khoản giảng viên mới
          </Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#ff6b35' }} />}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </Form.Item>

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
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò của bạn">
              <Option value="teacher">Giảng viên</Option>
              <Option value="head_of_department">Trưởng môn học</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Khoa/Bộ môn"
            rules={[{ required: true, message: 'Vui lòng nhập khoa/bộ môn!' }]}
          >
            <Input placeholder="Ví dụ: Khoa Công nghệ thông tin" />
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

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#ff6b35' }} />}
              placeholder="Nhập lại mật khẩu"
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" style={{ color: '#ff6b35' }}>
              Đăng nhập ngay
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
