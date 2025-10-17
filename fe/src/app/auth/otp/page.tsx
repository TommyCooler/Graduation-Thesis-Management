'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { SafetyCertificateOutlined, MailOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function OtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => params.get('email') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  useEffect(() => {
    if (!email) {
      message.warning('Thiếu email. Vui lòng đăng ký lại.');
      router.replace('/auth/register');
    }
  }, [email, router]);

  const onVerify = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: values.code }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        throw new Error(err || `Xác thực thất bại (HTTP ${res.status})`);
      }

      message.success('Xác thực OTP thành công!');
      // 👉 tuỳ luồng của bạn: sang login hay vào app
      router.push('/auth/login');
    } catch (e: any) {
      message.error(e?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      setResending(true);
      // TODO: thay endpoint resend thực tế nếu backend có
      // await fetch(`${API_BASE}/api/auth/otp/resend`, { method: 'POST', ... })
      await new Promise(r => setTimeout(r, 800));
      message.success('Đã gửi lại OTP (demo).');
    } catch {
      message.error('Gửi lại OTP thất bại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <SafetyCertificateOutlined className="text-4xl text-[#ff6b35]" />
          </div>
          <Title level={2} className="m-0 text-[#ff6b35]">Xác thực OTP</Title>
          <Text type="secondary">Nhập mã 6 số đã được gửi đến email:</Text>
          <div className="mt-2 flex items-center justify-center gap-2">
            <MailOutlined />
            <Text strong>{email}</Text>
          </div>
        </div>

        <Form name="otp" onFinish={onVerify} layout="vertical" size="large" initialValues={{ code: '' }}>
          <Form.Item
            name="code"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP!' },
              { pattern: /^[0-9]{6}$/, message: 'Mã OTP gồm 6 chữ số!' },
            ]}
          >
            <Input
              placeholder="••••••"
              maxLength={6}
              inputMode="numeric"
              autoFocus
              onInput={(e: any) => (e.target.value = e.target.value.replace(/\D/g, ''))}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<CheckCircleOutlined />}
            className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] text-base font-bold"
          >
            Xác thực
          </Button>

          <div className="flex items-center justify-between mt-4">
            <Button type="link" icon={<ReloadOutlined />} loading={resending} onClick={onResend}>
              Gửi lại OTP
            </Button>
            <Link href="/auth/register" className="text-gray-600">Sửa email?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
