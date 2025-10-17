'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

type ApiOk<T = any> = {
  code: number;           
  message?: string;
  data?: T;
};

type LoginData = {
  role?: 'LECTURER' | 'HEAD_OF_DEPARTMENT' | string;
  token?: string;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    form.setFields([
      { name: 'email', errors: [] },
      { name: 'password', errors: [] },
    ]);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email.trim(), password: values.password }),
      });

      const text = await res.text();
      let parsed: ApiOk<LoginData> | any = {};
      try { parsed = text ? JSON.parse(text) : {}; } catch { /* ignore parse errors */ }

      const payloadCode = typeof parsed?.code === 'number' ? parsed.code : undefined;
      const payloadMsg = parsed?.message as string | undefined;

      if (!res.ok || payloadCode !== 200) {
        if (payloadCode === 404) {
          form.setFields([{ name: 'email', errors: [payloadMsg || 'Không tìm thấy tài khoản'] }]);
          throw new Error(payloadMsg || 'Không tìm thấy tài khoản');
        }
        if (payloadCode === 401) {
          form.setFields([{ name: 'password', errors: [payloadMsg || 'Thông tin đăng nhập không hợp lệ'] }]);
          throw new Error(payloadMsg || 'Thông tin đăng nhập không hợp lệ');
        }
        const generic =
          payloadMsg ||
          (parsed as any)?.error ||
          (text || '').slice(0, 300) ||
          `Đăng nhập thất bại (HTTP ${res.status})`;
        throw new Error(generic);
      }

      const token = parsed?.data?.token as string | undefined;
      const role = parsed?.data?.role as string | undefined;
      if (!token) throw new Error('Không nhận được token từ máy chủ.');

      localStorage.setItem('accessToken', token);
      if (role) localStorage.setItem('role', role);

      message.success(parsed?.message || 'Đăng nhập thành công!');

      if (role === 'HEADOFDEPARTMENT') {
        router.push('/head-of-department/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const emailErr = form.getFieldError('email');
      const passErr = form.getFieldError('password');
      if (!(emailErr?.length || passErr?.length)) {
        message.error(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">Đăng nhập</Title>
          <Text type="secondary">Hệ thống quản lý đề tài khóa luận</Text>
        </div>

        <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix={<MailOutlined className="text-[#ff6b35]" />} placeholder="you@example.com" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập mật khẩu" />
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

        <Divider className="my-6"><Text type="secondary">Hoặc</Text></Divider>

        <div className="text-center">
          <Text type="secondary">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-[#ff6b35]">Đăng ký ngay</Link>
          </Text>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-600">← Quay về trang chủ</Link>
        </div>
      </Card>
    </div>
  );
}
