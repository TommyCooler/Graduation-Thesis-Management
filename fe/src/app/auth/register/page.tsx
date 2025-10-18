'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  const onFinish = async (values: any) => {
    form.setFields([{ name: 'email', errors: [] }]);

    if (!values.email?.toLowerCase().endsWith('@fpt.edu.vn')) {
      const msg = 'Chỉ chấp nhận email @fpt.edu.vn';
      form.setFields([{ name: 'email', errors: [msg] }]);
      toast.warn('Vui lòng dùng email @fpt.edu.vn');
      return;
    }

    const payload = {
      name: values.fullName?.trim(),
      email: values.email?.trim(),
      password: values.password,
      phoneNumber: values.phoneNumber?.trim(),
    };

    // Promise sẽ REJECT nếu API không ok -> toast.promise sẽ vào nhánh error và KHÔNG redirect
    type ApiError = { code: number; message: string };

    const doRegister = async () => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log(res)
      let body: any = null;
      try { body = raw ? JSON.parse(raw) : null; } catch { /* không phải JSON */ }

      if (!res.ok) {
        const code = (body?.code) as number;
        const message = (body?.message ?? `Đăng ký thất bại (HTTP ${res.status})`) as string;

        if (code === 400) {
          form.setFields([{ name: 'email', errors: [message] }]);
        }

        throw { code, message } as ApiError;
      }

      return body;
    };

    setLoading(true);
    try {
      await toast.promise(
        doRegister(),
        {
          pending: 'Đang tạo tài khoản...',
          success: 'Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP.',
          error: {
            render({ data }: { data?: ApiError }) {
              if (data?.code === 400) {
                return 'Email đã được sử dụng!';
              }
              return 'Có lỗi xảy ra, vui lòng thử lại sau.';
            }
          }
        }
      );
      router.push(`/auth/otp?email=${encodeURIComponent(values.email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserAddOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">Đăng ký</Title>
          <Text type="secondary">Tạo tài khoản mới</Text>
        </div>

        <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
            <Input prefix={<UserOutlined className="text-[#ff6b35]" />} placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined className="text-[#ff6b35]" />} placeholder="yourname@fpt.edu.vn" />
          </Form.Item>

          <Form.Item
            name="phoneNumber" label="Số điện thoại"
            rules={[{ required: true }, { pattern: /^[0-9]{8,15}$/, message: 'Chỉ gồm số (8–15 ký tự)!' }]}
          >
            <Input prefix={<PhoneOutlined className="text-[#ff6b35]" />} placeholder="0123456789" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }, { min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({ validator(_, v) { return !v || getFieldValue('password') === v ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); } }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] font-bold">
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-6"><Text type="secondary">Hoặc</Text></Divider>
        <div className="text-center">
          <Text type="secondary">Đã có tài khoản? <Link href="/auth/login" className="text-[#ff6b35]">Đăng nhập ngay</Link></Text>
        </div>
        <div className="text-center mt-4"><Link href="/" className="text-gray-600">← Quay về trang chủ</Link></div>
      </Card>
    </div>
  );
}
