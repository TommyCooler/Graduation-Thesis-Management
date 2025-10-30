'use client';
import { 
  Layout, 
  Card, 
  Table, 
  Typography, 
  Space, 
  Tag, 
  Button,
  Input,
  Select,
  Row,
  Col,
  Spin,
  Empty,
  Tooltip,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import React, { JSX, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';
import { topicService } from '../../../services/topicService';
import { useAuth } from '../../../hooks/useAuth';
import { TopicWithApprovalStatus, TOPIC_STATUS, STATUS_DISPLAY, STATUS_COLORS } from '../../../types/topic';
import type { ColumnsType } from 'antd/es/table';
import { Modal, Form, message } from 'antd';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function TopicsList(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated, getToken } = useAuth();
  
  const [topics, setTopics] = useState<TopicWithApprovalStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingTopic, setEditingTopic] = useState<TopicWithApprovalStatus | null>(null);
  const [form] = Form.useForm();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Load topics on mount and when filters change
  useEffect(() => {
    loadApprovedTopics();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    const token = getToken();
    if (token) {
      try {
        // Decode JWT to get userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId ? parseInt(payload.userId) : null);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  const loadApprovedTopics = async () => {
    try {
      setLoading(true);
      // Lấy danh sách topics đã được fully approved (2/2)
      const fullyApproved = await topicService.getFullyApprovedTopics();
      setTopics(fullyApproved);
    } catch (error) {
      console.error('Error loading approved topics:', error);
      message.error('Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadApprovedTopics();
  };

  const handleReset = () => {
    setSearchText('');
    setCurrentPage(1);
    loadApprovedTopics();
  };

  const getFilteredTopics = () => {
    if (!searchText) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(searchText.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleTableChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleViewDetail = (topicId: number) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push(`/topics/detail/${topicId}`);
  };

  const handleEditTopic = (topic: TopicWithApprovalStatus) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      title: topic.title,
      description: topic.description,
      status: topic.status,
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = getToken();
      const API_BASE = process.env.TOPIC_API_BASE_URL || 'http://localhost:8080';

      const response = await fetch(
        `${API_BASE}/topic-approval-service/api/topics/update/${editingTopic?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Send cookies with request
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            status: values.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.code !== 200) {
        throw new Error(data.message || 'Cập nhật thất bại');
      }

      message.success('Cập nhật đề tài thành công! Lịch sử thay đổi đã được lưu.');
      setIsEditModalVisible(false);
      form.resetFields();
      loadApprovedTopics(); // Reload danh sách
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật đề tài');
    }
  };

  const isTopicOwner = (topic: TopicWithApprovalStatus): boolean => {
    // Tạm thời cho phép tất cả user đã login có thể chỉnh sửa
    // Để test TopicHistoryService ghi nhận thay đổi
    // TODO: Sau này sẽ kiểm tra topic.createdBy === currentUserId
    return isAuthenticated;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const columns: ColumnsType<TopicWithApprovalStatus> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <Text strong>{title}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
      render: (description: string) => (
        <Tooltip title={description}>
          <Text type="secondary">{description}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: string) => {
        const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
        const text = STATUS_DISPLAY[status as keyof typeof STATUS_DISPLAY] || status;
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Nháp', value: TOPIC_STATUS.DRAFT },
        { text: 'Chờ xử lý', value: TOPIC_STATUS.PENDING },
        { text: 'Đã nộp', value: TOPIC_STATUS.SUBMITTED },
        { text: 'Đang xem xét', value: TOPIC_STATUS.UNDER_REVIEW },
        { text: 'Đã duyệt', value: TOPIC_STATUS.APPROVED },
        { text: 'Từ chối', value: TOPIC_STATUS.REJECTED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submitedAt',
      key: 'submitedAt',
      width: 160,
      render: (date: string | null) => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
      sorter: (a, b) => {
        if (!a.submitedAt) return 1;
        if (!b.submitedAt) return -1;
        return new Date(a.submitedAt).getTime() - new Date(b.submitedAt).getTime();
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend', // Mặc định sắp xếp mới nhất ở đầu
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: TopicWithApprovalStatus) => (
        <Space>
          <Tooltip title={isAuthenticated ? "Xem chi tiết" : "Đăng nhập để xem chi tiết"}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.id)}
            >
              Xem
            </Button>
          </Tooltip>
          {isAuthenticated && isTopicOwner(record) && (
            <Tooltip title="Chỉnh sửa đề tài">
              <Button
                type="default"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditTopic(record)}
              >
                Sửa
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Title level={2} className="text-orange-500 mb-2">
              <FileTextOutlined /> Danh sách đề tài
            </Title>
            <Paragraph className="text-base text-gray-600">
              Xem và tìm kiếm các đề tài đã được đăng tải
            </Paragraph>
          </div>

          {/* Filters */}
          <Card className="mb-6 shadow-sm">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tìm kiếm theo tên đề tài..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                  size="large"
                />
              </Col>

              <Col xs={24} sm={24} md={14}>
                <Space className="w-full justify-end">
                  <Button 
                    size="large" 
                    onClick={handleReset}
                    icon={<ReloadOutlined />}
                  >
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleSearch}
                    icon={<SearchOutlined />}
                  >
                    Tìm kiếm
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card className="shadow-lg">
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              {topics.length === 0 && !loading ? (
                <Empty
                  description="Chưa có đề tài nào được duyệt"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Table<TopicWithApprovalStatus>
                  columns={columns}
                  dataSource={getFilteredTopics()}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: getFilteredTopics().length,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} đề tài`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: handleTableChange,
                  }}
                  scroll={{ x: 1200 }}
                  bordered
                />
              )}
            </Spin>
          </Card>

          {/* Stats */}
          {topics.length > 0 && (
            <Row gutter={16} className="mt-6">
              <Col xs={24} sm={8}>
                <Card className="text-center">
                  <Text type="secondary">Tổng đề tài đã duyệt</Text>
                  <Title level={3} className="mb-0 mt-2">
                    {topics.length}
                  </Title>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="text-center">
                  <Text type="secondary">Đang hiển thị</Text>
                  <Title level={3} className="mb-0 mt-2">
                    {getFilteredTopics().length}
                  </Title>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="text-center">
                  <Text type="secondary">Trang hiện tại</Text>
                  <Title level={3} className="mb-0 mt-2">
                    {currentPage} / {Math.ceil(getFilteredTopics().length / pageSize) || 1}
                  </Title>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Content>

      {/* Edit Modal */}
      <Modal
        title={<Space><EditOutlined /> Chỉnh sửa đề tài</Space>}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Cập nhật"
        cancelText="Hủy"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Tên đề tài"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
          >
            <Input placeholder="Nhập tên đề tài" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả đề tài"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái" size="large">
              <Option value={TOPIC_STATUS.DRAFT}>Nháp</Option>
              <Option value={TOPIC_STATUS.PENDING}>Chờ xử lý</Option>
              <Option value={TOPIC_STATUS.SUBMITTED}>Đã nộp</Option>
            </Select>
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded">
            <Text type="secondary" className="text-sm">
              💡 Lưu ý: Mọi thay đổi sẽ được lưu vào lịch sử và có thể xem lại tại trang Lịch sử thay đổi.
            </Text>
          </div>
        </Form>
      </Modal>

      <Footer />
    </Layout>
  );
}
