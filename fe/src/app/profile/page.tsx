'use client';
import { useEffect, useState } from 'react';
import {
  Layout, Card, Typography, Avatar, Button, Spin, Tag, message,
  Row, Col, Divider, Modal, Form, Input
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined,
  ReloadOutlined, TeamOutlined, EditOutlined
} from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;

interface Account {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
}

export default function ProfilePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const fetchCurrentAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/account-service/api/accounts/current-account`, {
        headers: { Accept: '*/*'},
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tải hồ sơ');
      setAccount(data);
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCurrentAccount(); }, []);

  const translateRole = (role: string) => {
    switch (role) {
      case 'HEADOFDEPARTMENT': return 'Trưởng bộ môn';
      case 'LECTURER': return 'Giảng viên';
      case 'STUDENT': return 'Sinh viên';
      default: return role;
    }
  };

  const openEdit = () => {
    if (!account) return;
    form.setFieldsValue({
      username: account.name || '',
      phoneNumber: account.phoneNumber || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = async (values: { username: string; phoneNumber?: string }) => {
    if (!account) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/account-service/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: values.username,
          phoneNumber: values.phoneNumber ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Cập nhật hồ sơ thất bại');
      message.success('Cập nhật hồ sơ thành công!');
      setEditOpen(false);
      // Cập nhật state tại chỗ cho mượt:
      setAccount(a => a ? { ...a, name: values.username, phoneNumber: values.phoneNumber || null } : a);
    } catch (e: any) {
      message.error(e.message || 'Có lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-100vh">
      <Header />
      <Content className="p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md rounded-xl" style={{ background: 'linear-gradient(135deg,#fff5f0,#ffffff)' }}>
            {loading ? (
              <div className="flex justify-center items-center py-12 h-100"><Spin size="large" /></div>
            ) : account ? (
              <>
                <div className="flex flex-col items-center mb-6">
                  <Avatar size={100} icon={<UserOutlined />} className="bg-[#ff6b35] mb-4" />
                  <Title level={3} className="text-[#ff6b35] m-0">{account.name}</Title>
                  <Tag color="blue" style={{ fontSize: 14 }}>{translateRole(account.role)}</Tag>
                </div>

                <Divider />

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} className="bg-gray-50 shadow-sm">
                      <MailOutlined className="text-[#ff6b35] mr-2" />
                      <Text strong>Email:</Text><br /><Text>{account.email}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} className="bg-gray-50 shadow-sm">
                      <PhoneOutlined className="text-[#ff6b35] mr-2" />
                      <Text strong>Số điện thoại:</Text><br />
                      <Text>{account.phoneNumber || 'Chưa cập nhật'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} className="bg-gray-50 shadow-sm">
                      <IdcardOutlined className="text-[#ff6b35] mr-2" />
                      <Text strong>Mã người dùng:</Text><br /><Text>{account.id}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card bordered={false} className="bg-gray-50 shadow-sm">
                      <TeamOutlined className="text-[#ff6b35] mr-2" />
                      <Text strong>Chức vụ:</Text><br /><Text>{translateRole(account.role)}</Text>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <div className="flex justify-center gap-3 mt-6">
                  <Button icon={<EditOutlined />} onClick={openEdit}>Chỉnh sửa</Button>
                  <Button type="primary" icon={<ReloadOutlined />} className="bg-[#ff6b35] border-[#ff6b35]" onClick={fetchCurrentAccount}>Làm mới</Button>
                </div>

                <Modal
                  title="Chỉnh sửa hồ sơ"
                  open={editOpen}
                  onCancel={() => setEditOpen(false)}
                  onOk={() => form.submit()}
                  okText="Lưu"
                  cancelText="Hủy"
                  confirmLoading={loading}
                >
                  <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item
                      label="Họ tên / Username"
                      name="username"
                      rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                      <Input placeholder="Nhập tên hiển thị" />
                    </Form.Item>
                    <Form.Item
                      label="Số điện thoại"
                      name="phoneNumber"
                      rules={[
                        { pattern: /^[0-9+\-\s]{9,15}$/, message: 'Số điện thoại không hợp lệ' },
                      ]}
                    >
                      <Input placeholder="VD: 0903036506" />
                    </Form.Item>
                    <Form.Item label="Email (không thể sửa)">
                      <Input value={account.email} disabled />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 h-100">
                <UserOutlined className="text-5xl text-black mb-3" />
                <Text type="secondary" className='text-black'>Không có dữ liệu người dùng để hiển thị</Text>
              </div>
            )}
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
}
