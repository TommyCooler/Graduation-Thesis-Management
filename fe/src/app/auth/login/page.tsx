'use client';
import { useState } from 'react';
import { Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

type ApiOk<T = any> = { code: number; message?: string; data?: T };
type LoginData = { role?: string; token?: string };

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
            credentials: 'include',
            body: JSON.stringify({ email: values.email.trim(), password: values.password }),
          });

          const text = await res.text();
          let parsed: ApiOk<LoginData> | any = {};
          try { parsed = text ? JSON.parse(text) : {}; } catch { }

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

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="w-full max-w-6xl bg-white rounded-[28px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="relative p-8 md:p-12 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-400 text-white">
          <div className="max-w-md mt-3">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Quản lý<br />đồ án sinh viên<br />dễ dàng hơn.
            </h1>
            <p className="mt-4 text-white/90 font-medium">
              Hỗ trợ giảng viên theo dõi, đánh giá và quản lý tiến độ đồ án một cách trực quan, hiệu quả và thông minh.
            </p>
          </div>

          <div className="absolute bottom-0 right-4 md:right-32 hidden md:block">
            <Image
              src="/teacher.png"
              alt="illustration"
              width={320}
              height={320}
              className="object-contain"
            />
          </div>

          <div className="absolute top-6 left-6 bg-white/20 rounded-full px-3 py-2 text-sm font-semibold backdrop-blur">
            FPT Education
          </div>
        </div>


        <div className="px-6 md:px-10 py-10 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-bold text-4xl text-orange-500">FPT EDUCATION</span>
            </div>

            <Title level={2} className="!m-0 !leading-none">Welcome Back</Title>
            <Text type="secondary">Please login to your account</Text>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="mt-6"
            >
              <Form.Item
                name="email"
                label="Email address"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-[#ff6b35]" />}
                  placeholder="you@example.com"
                  className="h-12 rounded-2xl bg-[#f3f5f9] border-0 focus:bg-white"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                extra={<Link className="!text-orange-500" href="/auth/request-reset">Forgot password?</Link>}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-[#ff6b35]" />}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-[#f3f5f9] border-0 focus:bg-white"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-2xl text-base font-bold border-0
                           bg-orange-500 hover:bg-orange-600"
              >
                Login
              </Button>
            </Form>

            <Divider className="my-6">
              <span className="text-gray-400">Or Login with</span>
            </Divider>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                loading={googleLoading}
                className="h-11 rounded-2xl bg-white border border-gray-300 hover:!border-orange-500 hover:!text-orange-600"
              >
                Đang nhập với Google
              </Button>
            </div>

            <div className="text-center mt-6">
              <Text type="secondary">Don't have an account? </Text>
              <Link href="/auth/register" className="text-orange-500 font-semibold">Signup</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
