'use client';
import { useState } from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';

const { Title, Text } = Typography;

export default function RequestResetPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  const onSubmit = async (v: { email: string }) => {
    setLoading(true);
    try {
      await toast.promise(
        fetch(`${API_BASE}/api/auth/password/forgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: v.email.trim() }),
        }).then(async r => {
          const t = await r.text();
          const p = t ? JSON.parse(t) : {};
          if (!r.ok || p?.code !== 200) throw new Error(p?.message || t || `Gửi email thất bại (HTTP ${r.status})`);
        }),
        { pending: 'Đang gửi email...', success: 'Đã gửi email đặt lại mật khẩu!', error: { render: ({ data }: any) => data?.message || 'Có lỗi xảy ra.' } }
      );
      form.resetFields();
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3200} theme="colored" />
      <Card className="w-full max-w-sm shadow-xl rounded-xl" styles={{ body: { padding: '40px 32px' } }}>
        <div className="text-center mb-6">
          <Title level={2} className="m-0 text-[#ff6b35]">Quên mật khẩu</Title>
          <Text type="secondary">Nhập email để nhận liên kết đặt lại mật khẩu.</Text>
        </div>
        <Form form={form} layout="vertical" size="large" onFinish={onSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined className="text-[#ff6b35]" />} placeholder="you@example.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full h-12 bg-[#ff6b35] border-[#ff6b35] font-bold">
            Gửi email
          </Button>
        </Form>
      </Card>
    </div>
  );
}
