'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';
import { SafetyCertificateOutlined, MailOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;
type Api = { code?: number; message?: string; data?: any };

export default function OtpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => params.get('email') || '', [params]);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  // restore cooldown on reload
  useEffect(() => {
    if (!email) {
      toast.warn('Thiếu email. Vui lòng đăng ký lại.');
      router.replace('/auth/register');
      return;
    }
    const raw = localStorage.getItem(`otpCooldown:${email}`);
    if (raw) {
      const remain = Math.max(0, Math.ceil((Number(raw) - Date.now()) / 1000));
      if (remain > 0) startCooldown(remain);
    }
  }, [email, router]);

  const startCooldown = (sec: number) => {
    const until = Date.now() + sec * 1000;
    localStorage.setItem(`otpCooldown:${email}`, String(until));
    setCooldownSec(sec);
    const timer = setInterval(() => {
      const remain = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldownSec(remain);
      if (remain <= 0) {
        clearInterval(timer);
        localStorage.removeItem(`otpCooldown:${email}`);
      }
    }, 1000);
  };

  const onVerify = async (values: any) => {
    form.setFields([{ name: 'code', errors: [] }]);
    setLoading(true);
    setOtpExpired(false);

    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: values.code }),
      });
      const text = await res.text();
      let parsed: Api | any = {};
      try { parsed = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok || parsed?.code !== 200) {
        if (parsed?.code === 400) { // expired / not created
          setOtpExpired(true);
          form.setFields([{ name: 'code', errors: [parsed?.message || 'OTP đã hết hạn. Hãy yêu cầu mã mới.'] }]);
          toast.warn(parsed?.message || 'OTP đã hết hạn. Bấm Gửi lại OTP.');
          return;
        }
        if (parsed?.code === 401) { // invalid
          form.setFields([{ name: 'code', errors: [parsed?.message || 'Mã OTP không hợp lệ.'] }]);
          toast.error(parsed?.message || 'Mã OTP không hợp lệ.');
          return;
        }
      }

      toast.success('Xác thực OTP thành công!');
      router.push('/auth/login');
    } catch (e: any) {
      if (!form.getFieldError('code')?.length) toast.error(e?.message || 'Có lỗi khi xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (cooldownSec > 0) return;
    setResending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/resend`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let parsed: Api | any = {};
      try { parsed = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok || parsed?.code !== 200) {
        if (parsed?.code === 429) {
          const retry = Number(res.headers.get('Retry-After') || 60);
          startCooldown(retry);
          toast.warn(parsed?.message || `Bạn đã vượt quá số lần gửi. Thử lại sau ${retry}s.`);
          return;
        }
      }

      toast.success(parsed?.message || 'Đã gửi lại OTP. Vui lòng kiểm tra email.');
      setOtpExpired(false);
      form.setFieldsValue({ code: '' });
      startCooldown(60);
    } catch (err: any) {
      if (!String(err?.message).includes('429')) toast.error(err?.message || 'Gửi lại OTP thất bại.');
    } finally {
      setResending(false);
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
          <Title level={2} className="m-0 text-[#ff6b35]">Xác thực OTP</Title>
          <Text type="secondary">Nhập mã 6 số đã được gửi đến email:</Text>
          <div className="mt-2 flex items-center justify-center gap-2">
            <MailOutlined /><Text strong>{email}</Text>
          </div>
          {otpExpired && (
            <div className="mt-3 text-red-600 flex items-center justify-center gap-2">
              <ExclamationCircleOutlined />
              <span>Mã OTP đã hết hạn. Hãy bấm <b>Gửi lại OTP</b>.</span>
            </div>
          )}
        </div>

        <Form form={form} name="otp" onFinish={onVerify} layout="vertical" size="large" initialValues={{ code: '' }}>
          <Form.Item
            name="code"
            label="Mã OTP"
            validateStatus={otpExpired ? 'error' : undefined}
            rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { pattern: /^[0-9]{6}$/, message: 'Mã OTP gồm 6 chữ số!' }]}
          >
            <Input
              placeholder="••••••"
              maxLength={6}
              inputMode="numeric"
              autoFocus
              onInput={(e: any) => (e.target.value = e.target.value.replace(/\D/g, ''))}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />} className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] font-bold" disabled={resending}>
            Xác thực
          </Button>

          <div className="flex items-center justify-between mt-4">
            <Button type={otpExpired ? 'primary' : 'link'} icon={<ReloadOutlined />} loading={resending} onClick={onResend} disabled={cooldownSec > 0}>
              {cooldownSec > 0 ? `Gửi lại OTP (${cooldownSec}s)` : 'Gửi lại OTP'}
            </Button>
            <Link href="/auth/register" className="text-gray-600">Sửa email?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
