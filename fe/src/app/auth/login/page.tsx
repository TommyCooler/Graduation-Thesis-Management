'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

type ApiOk<T = any> = { code: number; message?: string; data?: T };
type LoginData = { role?: string; token?: string };

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  const onFinish = async (values: { email: string; password: string }) => {
    form.setFields([{ name: 'email', errors: [] }, { name: 'password', errors: [] }]);
    setLoading(true);

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { accept: '*/*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: values.email.trim(), password: values.password }),
            credentials: 'include',
          });

          const text = await res.text();
          let parsed: ApiOk<LoginData> | any = {};
          try { parsed = text ? JSON.parse(text) : {}; } catch {}

          if (!res.ok || parsed?.code !== 200) {
            if (parsed?.code === 404) {
              form.setFields([{ name: 'email', errors: [parsed?.message || 'Không tìm thấy tài khoản'] }]);
            } else if (parsed?.code === 401) {
              form.setFields([{ name: 'password', errors: [parsed?.message || 'Thông tin đăng nhập không hợp lệ'] }]);
            }
          }

          const token = parsed?.data?.token as string | undefined;
          const role = parsed?.data?.role as string | undefined;
          if (!token) throw new Error('Thông tin đăng nhập không hợp lệ');

          localStorage.setItem('accessToken', token);
          if (role) localStorage.setItem('role', role);

          if (role === 'HEAD_OF_DEPARTMENT' || role === 'HEADOFDEPARTMENT') router.push('/head-of-department/dashboard');
          else router.push('/');
        })(),
        {
          pending: 'Đang đăng nhập...',
          success: 'Đăng nhập thành công!',
          error: { render({ data }: any) { return data?.message || 'Đăng nhập thất bại.'; } },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">Đăng nhập</Title>
          <Text type="secondary">Hệ thống quản lý đề tài khóa luận</Text>
        </div>

        <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined className="text-[#ff6b35]" />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 bg-orange-500 border-orange-500 font-bold">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-6"><Text type="secondary">Hoặc</Text></Divider>
        <div className="text-center">
          <Text type="secondary">Chưa có tài khoản? <Link href="/auth/register" className="text-[#ff6b35]">Đăng ký ngay</Link></Text>
        </div>
        <div className="text-center mt-4">
          <Text type="secondary">Quên mật khẩu? <Link href="/auth/request-reset" className="text-[#ff6b35]">Đặt lại mật khẩu</Link></Text>
        </div>
        <div className="text-center mt-4"><Link href="/" className="text-gray-600">← Quay về trang chủ</Link></div>
      </Card>
    </div>
  );
}
