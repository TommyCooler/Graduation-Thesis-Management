'use client';
import React, { useState } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function ReviewCouncilPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCouncil, setEditingCouncil] = useState(null);

  // Mock data for councils
  const [councils, setCouncils] = useState([
    {
      id: 1,
      name: 'Hội đồng Công nghệ thông tin 1',
      topic: 'AI và Machine Learning',
      milestone: 'WEEK 8',
      reviewDate: '2024-02-15',
      status: 'Đã lập',
      lecturers: ['TS. Nguyễn Văn A', 'ThS. Trần Thị B'],
      feedback: '',
    },
    {
      id: 2,
      name: 'Hội đồng Phát triển Web',
      topic: 'Ứng dụng Web hiện đại',
      milestone: 'WEEK 12',
      reviewDate: '2024-03-20',
      status: 'Hoàn thành',
      lecturers: ['TS. Phạm Văn C', 'ThS. Lê Thị D', 'ThS. Hoàng Văn E'],
      feedback: 'Sinh viên đã hoàn thành tốt các yêu cầu',
    },
  ]);

  // Mock data for topics
  const topics = [
    'AI và Machine Learning',
    'Ứng dụng Web hiện đại',
    'Blockchain và Cryptocurrency',
    'IoT và Smart Systems',
    'Mobile Application Development',
    'Cloud Computing',
  ];

  // Mock data for lecturers
  const lecturers = [
    'TS. Nguyễn Văn A',
    'ThS. Trần Thị B',
    'TS. Phạm Văn C',
    'ThS. Lê Thị D',
    'ThS. Hoàng Văn E',
    'TS. Vũ Thị F',
    'ThS. Đặng Văn G',
  ];

  const milestones = ['WEEK 4', 'WEEK 8', 'WEEK 12'];
  const statuses = ['Đã lập', 'Hoàn thành', 'Đã hủy'];

  const showModal = () => {
    setEditingCouncil(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCouncil(record);
    form.setFieldsValue({
      ...record,
      reviewDate: record.reviewDate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa hội đồng này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setCouncils(councils.filter(c => c.id !== id));
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingCouncil) {
        // Update existing council
        setCouncils(councils.map(c => 
          c.id === editingCouncil.id 
            ? { ...c, ...values, reviewDate: values.reviewDate.format('YYYY-MM-DD') }
            : c
        ));
      } else {
        // Create new council
        const newCouncil = {
          id: councils.length + 1,
          ...values,
          reviewDate: values.reviewDate.format('YYYY-MM-DD'),
          feedback: '',
        };
        setCouncils([...councils, newCouncil]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã lập':
        return 'blue';
      case 'Hoàn thành':
        return 'green';
      case 'Đã hủy':
        return 'red';
      default:
        return 'default';
    }
  };

  const getMilestoneColor = (milestone) => {
    switch (milestone) {
      case 'WEEK 4':
        return 'orange';
      case 'WEEK 8':
        return 'cyan';
      case 'WEEK 12':
        return 'purple';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Tên hội đồng',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      width: '15%',
    },
    {
      title: 'Milestone',
      dataIndex: 'milestone',
      key: 'milestone',
      width: '10%',
      render: (milestone) => (
        <Tag color={getMilestoneColor(milestone)}>{milestone}</Tag>
      ),
    },
    {
      title: 'Ngày review',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      width: '12%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturers',
      key: 'lecturers',
      width: '18%',
      render: (lecturers) => (
        <div>
          {lecturers.slice(0, 2).map((lecturer, idx) => (
            <Tag key={idx} style={{ marginBottom: 4 }}>{lecturer}</Tag>
          ))}
          {lecturers.length > 2 && (
            <Tag>+{lecturers.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '13%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-6 bg-gray-100">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Card>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  Quản lý Hội đồng Review
                </Title>
                <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                  Tạo và quản lý các hội đồng chấm review khóa luận
                </p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                size="large"
              >
                Tạo hội đồng mới
              </Button>
            </div>

          <Table
            columns={columns}
            dataSource={councils}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} hội đồng`,
            }}
          />
        </Card>

        <Modal
          title={editingCouncil ? 'Chỉnh sửa hội đồng' : 'Tạo hội đồng mới'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          okText={editingCouncil ? 'Cập nhật' : 'Tạo'}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: 'Đã lập',
            }}
          >
            <Form.Item
              name="name"
              label="Tên hội đồng"
              rules={[{ required: true, message: 'Vui lòng nhập tên hội đồng!' }]}
            >
              <Input placeholder="Nhập tên hội đồng" />
            </Form.Item>

            <Form.Item
              name="topic"
              label="Topic"
              rules={[{ required: true, message: 'Vui lòng chọn topic!' }]}
            >
              <Select placeholder="Chọn topic">
                {topics.map(topic => (
                  <Option key={topic} value={topic}>{topic}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="milestone"
              label="Milestone"
              rules={[{ required: true, message: 'Vui lòng chọn milestone!' }]}
            >
              <Select placeholder="Chọn milestone">
                {milestones.map(milestone => (
                  <Option key={milestone} value={milestone}>{milestone}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="reviewDate"
              label="Ngày review"
              rules={[{ required: true, message: 'Vui lòng chọn ngày review!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            {/* <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {statuses.map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Form.Item> */}

            <Form.Item
              name="lecturers"
              label="Giảng viên"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một giảng viên!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn giảng viên"
                maxTagCount={3}
              >
                {lecturers.map(lecturer => (
                  <Option key={lecturer} value={lecturer}>{lecturer}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Content>
    
    <Footer />
  </Layout>
  );
}