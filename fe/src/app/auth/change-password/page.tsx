'use client';
import { useMemo, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;

type ApiResp<T = any> = { code?: number; message?: string; data?: T };

type FormValues = {
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export default function FirstLoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = useMemo(() => params.get('email') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!email) {
      toast.warn('Thiếu tham số email. Vui lòng đăng nhập lại để tiếp tục.');
    }
  }, [email]);

  const onSubmit = async (values: FormValues) => {
    if (!email) {
      toast.error('Thiếu email. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        (async () => {
          const res = await fetch(
            `${API_BASE}/account-service/api/auth/password/change-first-login`,
            {
              method: 'POST',
              headers: { accept: '*/*', 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                newPassword: values.password,
                name: values.name,
                phoneNumber: values.phoneNumber,
              }),
            }
          );

          const text = await res.text();
          let parsed: ApiResp | any = {};
          try {
            parsed = text ? JSON.parse(text) : {};
          } catch {}

          if (!res.ok || parsed?.code !== 200) {
            if (parsed?.code === 400)
              throw new Error(parsed?.message || 'Yêu cầu không hợp lệ.');
            if (parsed?.code === 401)
              throw new Error(
                parsed?.message || 'Phiên đăng nhập không hợp lệ. Vui lòng thử lại.'
              );
            if (parsed?.code === 410 || /expired|hết hạn/i.test(parsed?.message || '')) {
              throw new Error(
                parsed?.message ||
                  'Mật khẩu tạm đã hết hạn. Vui lòng yêu cầu cấp lại mật khẩu.'
              );
            }
            throw new Error(
              parsed?.message ||
                text ||
                `Đổi mật khẩu lần đầu thất bại (HTTP ${res.status})`
            );
          }
        })(),
        {
          pending: 'Đang cập nhật mật khẩu...',
          success: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
          error: {
            render({ data }: any) {
              return data?.message || 'Cập nhật mật khẩu thất bại.';
            },
          },
        }
      );

      form.resetFields();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#fff5f0] to-white flex items-center justify-center px-4">
      <ToastContainer position="top-right" autoClose={3200} theme="colored" />
      <Card
        className="w-full max-w-md shadow-lg rounded-2xl border border-orange-100"
        styles={{ body: { padding: '24px 22px' } }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-[#fff0e8] rounded-full flex items-center justify-center">
            <SafetyCertificateOutlined className="text-2xl text-[#ff6b35]" />
          </div>
          <div className="flex-1">
            <Title level={3} className="m-0 text-[#ff6b35] flex justify-center">
              Đổi mật khẩu lần đầu
            </Title>
            <Text type="secondary" className="text-xs">
              Cập nhật thông tin tài khoản để bắt đầu sử dụng hệ thống.
            </Text>
          </div>
        </div>

        <Form<FormValues>
          form={form}
          layout="vertical"
          size="middle"
          onFinish={onSubmit}
          style={{ marginTop: 4 }}
        >
          {/* Email (không cho sửa) */}
          <Form.Item
            label={<span className="text-[13px]">Email</span>}
            tooltip="Được chuyển từ màn hình đăng nhập"
            required
            style={{ marginBottom: 10 }}
          >
            <Input
              size="middle"
              prefix={<MailOutlined className="text-[#ff6b35]" />}
              value={email}
              disabled
            />
          </Form.Item>

          {/* Họ và tên */}
          <Form.Item
            name="name"
            label={<span className="text-[13px]">Họ và tên</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              {
                min: 6,
                max: 50,
                message: 'Họ và tên phải từ 6 đến 50 ký tự!',
              },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input
              size="middle"
              prefix={<UserOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="phoneNumber"
            label={<span className="text-[13px]">Số điện thoại</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              {
                pattern: /^\+?[0-9]{7,15}$/,
                message:
                  'Số điện thoại không hợp lệ! (7–15 chữ số, có thể có dấu + ở đầu)',
              },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input
              size="middle"
              prefix={<PhoneOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>

          {/* Mật khẩu mới */}
          <Form.Item
            name="password"
            label={<span className="text-[13px]">Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input.Password
              size="middle"
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          {/* Xác nhận mật khẩu */}
          <Form.Item
            name="confirmPassword"
            label={<span className="text-[13px]">Xác nhận mật khẩu</span>}
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
            style={{ marginBottom: 14 }}
          >
            <Input.Password
              size="middle"
              prefix={<LockOutlined className="text-[#ff6b35]" />}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-10 bg-[#ff6b35] border-[#ff6b35] font-semibold rounded-lg"
            disabled={!email}
          >
            Cập nhật tài khoản
          </Button>

          <div className="text-center mt-3">
            <Link href="/auth/login" className="text-gray-500 text-xs hover:text-[#ff6b35]">
              ← Quay về đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
