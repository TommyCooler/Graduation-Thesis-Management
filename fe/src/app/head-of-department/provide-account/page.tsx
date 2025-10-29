'use client';
import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Input,
  Table,
  Space,
  Modal,
  Form,
  message,
  Tag,
  Typography,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  MailOutlined,
} from '@ant-design/icons';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;

interface Account {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  createdAt: string;
  active: boolean;
}

export default function AccountProvisionPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const fetchAccounts = async (page = 1, size = 10) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/account-service/api/accounts/all-paged?page=${page}&size=${size}`,
        {
          headers: {
            Accept: '*/*',
          },
          credentials: 'include',
        }
      );

      const data = await res.json();
      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || 'Không thể tải danh sách tài khoản');
      }

      const { content, totalElements } = data.data;
      setAccounts(content);
      setPagination({
        current: page,
        pageSize: size,
        total: totalElements,
      });
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleProvideEmail = async (values: any) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/account-service/api/auth/provide-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();
      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || 'Không thể cấp tài khoản');
      }

      message.success('Cấp tài khoản thành công!');
      form.resetFields();
      setIsModalVisible(false);
      fetchAccounts(pagination.current, pagination.pageSize);
    } catch (err: any) {
      message.error(err.message || 'Có lỗi xảy ra khi cấp tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔍 Tìm kiếm cục bộ
  const filteredAccounts = accounts.filter((acc) =>
    acc.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color =
          role === 'HEADOFDEPARTMENT'
            ? 'orange'
            : role === 'LECTURER'
            ? 'blue'
            : 'green';
        const roleText =
          role === 'HEADOFDEPARTMENT'
            ? 'Trưởng bộ môn'
            : role === 'LECTURER'
            ? 'Giảng viên'
            : role;
        return <Tag color={color}>{roleText}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) =>
        new Date(text).toLocaleString('vi-VN', { hour12: false }),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Header */}
          <Card className="mb-6 shadow-sm">
            <Title level={3} className="text-[#ff6b35] m-0">
              Quản lý tài khoản người dùng
            </Title>
            <Text type="secondary">
              Trang này cho phép <b>Trưởng bộ môn</b> xem và cấp tài khoản truy
              cập.
            </Text>
          </Card>

          {/* Tìm kiếm và cấp tài khoản */}
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Tìm kiếm email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="bg-[#ff6b35] border-[#ff6b35]"
            >
              Cấp tài khoản
            </Button>
          </Space>

          {/* Bảng danh sách */}
          <Card>
            <Table
              dataSource={filteredAccounts}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `${total} tài khoản`,
                onChange: (page, pageSize) => fetchAccounts(page, pageSize),
              }}
            />
          </Card>
        </div>
      </Content>

      {/* Modal cấp tài khoản */}
      <Modal
        title="Cấp tài khoản mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Cấp"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleProvideEmail}>
          <Form.Item
            label="Email người dùng"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="vd: user@gmail.com" />
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </Layout>
  );
}
