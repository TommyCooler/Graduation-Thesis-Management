'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';import Link from 'next/link';
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
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <Card
        className="w-full max-w-sm shadow-xl rounded-xl"
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserAddOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">
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
              prefix={<UserOutlined className="text-[#ff6b35]" />}
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
              prefix={<MailOutlined className="text-[#ff6b35]" />}
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
              prefix={<LockOutlined className="text-[#ff6b35]" />}
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
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] text-base font-bold"
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-6">
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <div className="text-center">
          <Text type="secondary">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-[#ff6b35]">
              Đăng nhập ngay
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