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
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <Card
        className="w-full max-w-sm shadow-xl rounded-xl"
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">
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
              prefix={<MailOutlined className="text-[#ff6b35]" />}
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
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
             className="w-full h-12 bg-orange-500 border-orange-500 text-base font-bold"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-6">
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <div className="text-center">
          <Text type="secondary">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-[#ff6b35]">
              Đăng ký ngay
            </Link>
          </Text>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-600">
            ← Quay về trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
}