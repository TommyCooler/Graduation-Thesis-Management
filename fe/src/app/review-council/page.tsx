'use client';
import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import reviewCouncilService, { ReviewCouncilUIModel } from '../../services/reviewCouncilService';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function ReviewCouncilPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCouncil, setEditingCouncil] = useState<ReviewCouncilUIModel | null>(null);
  // view lecturers modal
  const [isLecturerModalVisible, setIsLecturerModalVisible] = useState(false);
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);


  // Councils from API
  const [councils, setCouncils] = useState<ReviewCouncilUIModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Temporary static dropdowns (replace with real APIs when available)
  const topics = [
    'AI và Machine Learning',
    'Ứng dụng Web hiện đại',
    'Blockchain và Cryptocurrency',
    'IoT và Smart Systems',
    'Mobile Application Development',
    'Cloud Computing',
  ];

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

  const fetchCouncils = async () => {
    try {
      setLoading(true);
      const data = await reviewCouncilService.getAllCouncils();
      setCouncils(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hội đồng:', err);
      // Fallback data khi API fail (CORS hoặc lỗi khác)
      setCouncils([
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouncils();
  }, []);

  const showModal = () => {
    setEditingCouncil(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ReviewCouncilUIModel) => {
    setEditingCouncil(record);
    form.setFieldsValue({
      ...record,
      reviewDate: record.reviewDate,
    });
    setIsModalVisible(true);
  };

  // View lecturers modal
  const handleViewLecturers = (lecturers: string[]) => {
    setSelectedLecturers(lecturers);
    setIsLecturerModalVisible(true);
  };


  const handleDelete = (id: number) => {
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCouncil) {
        // For now, skip update wiring if backend not ready
        await fetchCouncils();
      } else {
        try {
          await reviewCouncilService.createCouncil({
            name: values.name,
            topic: values.topic,
            milestone: values.milestone,
            reviewDate: values.reviewDate.format('YYYY-MM-DD'),
            lecturers: values.lecturers || [],
          });
          await fetchCouncils();
        } catch (apiError) {
          console.error('Lỗi khi tạo hội đồng:', apiError);
          // Tạm thời thêm vào local state khi API fail
          const newCouncil = {
            id: Date.now(), // temporary ID
            name: values.name,
            topic: values.topic,
            milestone: values.milestone,
            reviewDate: values.reviewDate.format('YYYY-MM-DD'),
            status: 'Đã lập',
            lecturers: values.lecturers || [],
            feedback: '',
          };
          setCouncils(prev => [...prev, newCouncil]);
        }
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (e) {
      // validation failed or API error already logged
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status: string) => {
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

  const getMilestoneColor = (milestone: string) => {
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
      render: (milestone: string) => (
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturers',
      key: 'lecturers',
      width: '18%',
      render: (lecturers: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {lecturers.slice(0, 2).map((lecturer: string, idx: number) => (
            <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
              {lecturer}
            </Tag>
          ))}

          {lecturers.length > 2 && (
            <Tag color="default">+{lecturers.length - 2} nữa</Tag>
          )}

          <Button
            type="link"
            size="small"
            onClick={() => handleViewLecturers(lecturers)}
            style={{ padding: 0 }}
          >
            Xem tất cả
          </Button>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '13%',
      render: (_: unknown, record: ReviewCouncilUIModel) => (
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
              loading={loading}
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

        <Modal
          title="Danh sách giảng viên"
          open={isLecturerModalVisible}
          onCancel={() => setIsLecturerModalVisible(false)}
          footer={null}
        >
          {selectedLecturers.length > 0 ? (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {selectedLecturers.map((lecturer, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
                    {lecturer}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có giảng viên nào trong hội đồng này.</p>
          )}
        </Modal>

      </Content>

      <Footer />
    </Layout>
  );
}