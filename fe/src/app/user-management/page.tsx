'use client';
import { Layout, Button, Table, Input, Row, Col, Card, Typography, Tag, Dropdown, Space, Modal, Form } from 'antd';
import { 
  SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, MoreOutlined, FilterOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import Sidebar from './sidebar';
import Link from 'next/link';
import type { TableProps } from 'antd/es/table';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export default function UserManagementPage() {
  // State để quản lý dữ liệu
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<User>();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Dữ liệu mẫu
  const users: User[] = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com', role: 'Giảng viên', department: 'Công nghệ thông tin', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'thib@example.com', role: 'Trưởng môn', department: 'Công nghệ thông tin', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'vanc@example.com', role: 'Giảng viên', department: 'Quản trị kinh doanh', status: 'inactive' },
    { id: 4, name: 'Phạm Thị D', email: 'thid@example.com', role: 'Giảng viên', department: 'Ngôn ngữ Anh', status: 'active' },
    { id: 5, name: 'Hoàng Văn E', email: 'vane@example.com', role: 'Trưởng môn', department: 'Quản trị kinh doanh', status: 'active' },
  ];

  // Cột dữ liệu cho bảng
  const columns: TableProps<User>['columns'] = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Giảng viên', value: 'Giảng viên' },
        { text: 'Trưởng môn', value: 'Trưởng môn' },
      ],
      onFilter: (value, record: User) => record.role.indexOf(value as string) === 0,
      render: (role: string) => (
        <Tag color={role === 'Trưởng môn' ? 'orange' : 'blue'}>
          {role}
        </Tag>
      ),
    },    {
      title: 'Khoa',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'Công nghệ thông tin', value: 'Công nghệ thông tin' },
        { text: 'Quản trị kinh doanh', value: 'Quản trị kinh doanh' },
        { text: 'Ngôn ngữ Anh', value: 'Ngôn ngữ Anh' },
      ],
      onFilter: (value, record: User) => record.department.indexOf(value as string) === 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Dropdown 
          menu={{ 
            items: [
              {
                key: '1',
                label: 'Chỉnh sửa',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: '2',
                label: 'Xóa',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ] 
          }} 
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa người dùng',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        // Code xử lý xóa người dùng
      }
    });
  };

  const handleAddNew = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        // Code xử lý thêm/cập nhật người dùng
        setIsModalVisible(false);
      })
      .catch(err => {
        console.log('Validate Failed:', err);
      });
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Layout>
        {/* Sử dụng component Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />        {/* Main Content */}
        <Layout className="pb-6">
          <Content>
            {/* Banner */}
            <div className="bg-gradient-to-br from-orange-50 to-white py-10 px-6">
              <div className="max-w-6xl mx-auto">
                <Title level={1} className="text-4xl mb-4">
                  Quản lý <span className="text-orange-500">Người dùng</span>
                </Title>
                <Paragraph className="text-base text-gray-600 mb-0">
                  Quản lý tài khoản giảng viên, trưởng môn và phân quyền hệ thống
                </Paragraph>
              </div>
            </div>            {/* Main Content */}
            <div className="py-10 px-6 bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <Card bordered={false}>
                  {/* Search and Actions */}
                  <Row gutter={16} className="mb-5" align="middle">
                    <Col xs={24} md={16} lg={18}>
                      <Space size="large">                        <Input.Search 
                          placeholder="Tìm kiếm theo tên hoặc email" 
                          allowClear 
                          enterButton={<SearchOutlined />}
                          className="w-80" 
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button icon={<FilterOutlined />}>
                          Bộ lọc
                        </Button>
                      </Space>
                    </Col>                    <Col xs={24} md={8} lg={6} className="text-right">
                      <Button 
                        type="primary" 
                        icon={<UserAddOutlined />} 
                        onClick={handleAddNew}
                        className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                      >
                        Thêm người dùng
                      </Button>
                    </Col>
                  </Row>

                  {/* Users Table */}
                  <Table 
                    columns={columns} 
                    dataSource={users} 
                    rowKey="id"
                    pagination={{ 
                      defaultPageSize: 10, 
                      showSizeChanger: true, 
                      pageSizeOptions: ['10', '20', '50'],
                      showTotal: (total) => `Tổng số: ${total} người dùng`
                    }}
                  />
                </Card>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Modal Thêm/Sửa người dùng */}
      <Modal
        title={form.getFieldValue('id') ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}        okText={form.getFieldValue('id') ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
            <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Input.Group compact>
              <Form.Item name="role" noStyle>
                <select className="w-full px-3 py-1 rounded-md border border-gray-300 focus:border-orange-500 focus:outline-none">
                  <option value="">Chọn vai trò</option>
                  <option value="Giảng viên">Giảng viên</option>
                  <option value="Trưởng môn">Trưởng môn</option>
                </select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
            <Form.Item
            name="department"
            label="Khoa/Bộ môn"
            rules={[{ required: true, message: 'Vui lòng chọn khoa/bộ môn!' }]}
          >
            <Input.Group compact>
              <Form.Item name="department" noStyle>
                <select className="w-full px-3 py-1 rounded-md border border-gray-300 focus:border-orange-500 focus:outline-none">
                  <option value="">Chọn khoa/bộ môn</option>
                  <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                  <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                  <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
                </select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
            <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
          >
            <Input.Group compact>
              <Form.Item name="status" noStyle>
                <select className="w-full px-3 py-1 rounded-md border border-gray-300 focus:border-orange-500 focus:outline-none">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </Layout>
  );
}