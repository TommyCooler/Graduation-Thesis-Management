'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

type ApiResp<T = any> = { code?: number; message?: string; data?: T };

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!token) {
      toast.warn('Thiếu token đặt lại mật khẩu. Vui lòng yêu cầu email mới.');
    }
  }, [token]);

  const onSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast.error('Thiếu token. Vui lòng quay lại yêu cầu đặt lại mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`${API_BASE}/account-service/api/auth/password/reset`, {
            method: 'POST',
            headers: { accept: '*/*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: values.password }),
          });

          const text = await res.text();
          let parsed: ApiResp | any = {};
          try { parsed = text ? JSON.parse(text) : {}; } catch {}

          // Chuẩn: code === 200
          if (!res.ok || parsed?.code !== 200) {
            // các case hay gặp
            if (parsed?.code === 400) throw new Error(parsed?.message || 'Yêu cầu không hợp lệ.');
            if (parsed?.code === 401) throw new Error(parsed?.message || 'Token không hợp lệ.');
            if (parsed?.code === 410 || /expired|hết hạn/i.test(parsed?.message || '')) {
              throw new Error(parsed?.message || 'Token đã hết hạn. Vui lòng yêu cầu lại.');
            }
            throw new Error(parsed?.message || text || `Đặt lại mật khẩu thất bại (HTTP ${res.status})`);
          }
        })(),
        {
          pending: 'Đang đặt lại mật khẩu...',
          success: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.',
          error: { render({ data }: any) { return data?.message || 'Đặt lại mật khẩu thất bại.'; } },
        }
      );

      // Reset form và chuyển trang
      form.resetFields();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3200} theme="colored" />
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <SafetyCertificateOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">Đặt lại mật khẩu</Title>
          <Text type="secondary">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </Text>
        </div>

        <Form form={form} layout="vertical" size="large" onFinish={onSubmit}>
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, v) {
                  if (!v || getFieldValue('password') === v) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] font-bold"
            disabled={!token}
          >
            Cập nhật mật khẩu
          </Button>

          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-gray-600">
              ← Quay về đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
