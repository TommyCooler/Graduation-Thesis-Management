'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

type ApiResp<T = any> = { code?: number; message?: string; data?: T };
export default function FirstLoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => params.get('email') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    if (!email) {
      toast.warn('Thiếu tham số username. Vui lòng đăng nhập lại để tiếp tục.');
    }
  }, [email]);

  const onSubmit = async (values: { tempPassword: string; password: string; confirmPassword: string }) => {
    if (!email) {
      toast.error('Thiếu username. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`${API_BASE}/api/auth/password/change-first-login`, {
            method: 'POST',
            headers: { accept: '*/*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword: values.password }),
          });

          const text = await res.text();
          let parsed: ApiResp | any = {};
          try { parsed = text ? JSON.parse(text) : {}; } catch {}

          // success convention: code === 200 (adjust to your API)
          if (!res.ok || parsed?.code !== 200) {
            if (parsed?.code === 400) throw new Error(parsed?.message || 'Yêu cầu không hợp lệ.');
            if (parsed?.code === 401) throw new Error(parsed?.message || 'Sai mật khẩu tạm hoặc phiên không hợp lệ.');
            if (parsed?.code === 410 || /expired|hết hạn/i.test(parsed?.message || '')) {
              throw new Error(parsed?.message || 'Mật khẩu tạm đã hết hạn. Vui lòng yêu cầu cấp lại.');
            }
            throw new Error(parsed?.message || text || `Đổi mật khẩu lần đầu thất bại (HTTP ${res.status})`);
          }
        })(),
        {
          pending: 'Đang cập nhật mật khẩu...',
          success: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
          error: { render({ data }: any) { return data?.message || 'Cập nhật mật khẩu thất bại.'; } },
        }
      );

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
          <Title level={2} className="m-0 text-[#ff6b35]">Đổi mật khẩu lần đầu</Title>
          <Text type="secondary">
            Đăng nhập bằng cách đặt <b>mật khẩu mới</b> để sử dụng tiếp.
          </Text>
        </div>

        <Form form={form} layout="vertical" size="large" onFinish={onSubmit}>
          <Form.Item label="Tài khoản" tooltip="Được chuyển từ màn hình đăng nhập" required>
            <Input prefix={<UserOutlined className="text-[#ff6b35]" />} value={email} disabled />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Tối thiểu 1 chữ và 1 số.' },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập mật khẩu mới" />
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
            <Input.Password prefix={<LockOutlined className="text-[#ff6b35]" />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] font-bold"
            disabled={!email}
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