'use client';
import { useState } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  Typography, 
  Modal, 
  Form, 
  message,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FilterOutlined
} from '@ant-design/icons';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock data cho danh sách đề tài
const mockTheses = [
  {
    id: 1,
    title: "Hệ thống quản lý thư viện số sử dụng AI và Machine Learning",
    student: "Nguyễn Văn A",
    studentId: "SE123456",
    supervisor: "ThS. Trần Thị B",
    department: "Khoa Công nghệ thông tin",
    submittedDate: "2024-01-15",
    status: "pending",
    priority: "high",
    abstract: "Đề tài nghiên cứu về việc ứng dụng trí tuệ nhân tạo và machine learning trong việc quản lý thư viện số, giúp tự động hóa quy trình phân loại, tìm kiếm và đề xuất tài liệu cho người dùng.",
    objectives: [
      "Xây dựng hệ thống quản lý thư viện số hiện đại",
      "Ứng dụng AI để phân loại và tìm kiếm tài liệu",
      "Phát triển thuật toán đề xuất tài liệu phù hợp",
      "Tối ưu hóa trải nghiệm người dùng"
    ],
    methodology: "Sử dụng các thuật toán machine learning như Random Forest, Neural Networks và Natural Language Processing để phân tích và phân loại tài liệu.",
    expectedResults: "Hệ thống có khả năng phân loại tài liệu với độ chính xác trên 90% và đề xuất tài liệu phù hợp với sở thích người dùng.",
    plagiarismScore: 15.2,
    reviewers: [
      { name: "TS. Nguyễn Văn C", status: "approved", date: "2024-01-16" },
      { name: "ThS. Lê Thị D", status: "pending", date: null }
    ]
  },
  {
    id: 2,
    title: "Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản",
    student: "Lê Văn C",
    studentId: "SE123457",
    supervisor: "TS. Phạm Thị D",
    department: "Khoa Công nghệ thông tin",
    submittedDate: "2024-01-14",
    status: "pending",
    priority: "medium",
    abstract: "Nghiên cứu ứng dụng công nghệ blockchain để tạo ra hệ thống minh bạch và đáng tin cậy trong quản lý chuỗi cung ứng nông sản từ sản xuất đến tiêu dùng.",
    objectives: [
      "Xây dựng hệ thống blockchain cho chuỗi cung ứng",
      "Đảm bảo tính minh bạch và truy xuất nguồn gốc",
      "Tối ưu hóa quy trình logistics",
      "Tăng cường niềm tin của người tiêu dùng"
    ],
    methodology: "Sử dụng Ethereum blockchain, smart contracts và IoT sensors để theo dõi và ghi lại thông tin sản phẩm tại mỗi bước trong chuỗi cung ứng.",
    expectedResults: "Hệ thống có thể theo dõi 100% sản phẩm từ nông trại đến người tiêu dùng với thời gian phản hồi dưới 5 giây.",
    plagiarismScore: 8.5,
    reviewers: [
      { name: "TS. Nguyễn Văn C", status: "approved", date: "2024-01-15" },
      { name: "ThS. Lê Thị D", status: "rejected", date: "2024-01-16" }
    ]
  },
  {
    id: 3,
    title: "Phát triển ứng dụng IoT cho nông nghiệp thông minh",
    student: "Hoàng Thị E",
    studentId: "SE123458",
    supervisor: "ThS. Nguyễn Văn F",
    department: "Khoa Công nghệ thông tin",
    submittedDate: "2024-01-13",
    status: "approved",
    priority: "low",
    abstract: "Xây dựng hệ thống IoT để giám sát và điều khiển tự động các yếu tố môi trường trong nông nghiệp như độ ẩm, nhiệt độ, ánh sáng và dinh dưỡng đất.",
    objectives: [
      "Thiết kế hệ thống cảm biến IoT",
      "Phát triển ứng dụng điều khiển tự động",
      "Tối ưu hóa năng suất cây trồng",
      "Giảm thiểu tác động môi trường"
    ],
    methodology: "Sử dụng các cảm biến IoT, microcontrollers và machine learning để phân tích dữ liệu và đưa ra quyết định tự động.",
    expectedResults: "Tăng năng suất cây trồng 20-30% và giảm 40% lượng nước tưới so với phương pháp truyền thống.",
    plagiarismScore: 5.8,
    reviewers: [
      { name: "TS. Nguyễn Văn C", status: "approved", date: "2024-01-14" },
      { name: "ThS. Lê Thị D", status: "approved", date: "2024-01-15" }
    ]
  }
];

export default function ThesisReviewPage() {
  const [selectedThesis, setSelectedThesis] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [form] = Form.useForm();

  // Filter data based on search and filters
  const filteredTheses = mockTheses.filter(thesis => {
    const matchesSearch = thesis.title.toLowerCase().includes(searchText.toLowerCase()) ||
                        thesis.student.toLowerCase().includes(searchText.toLowerCase()) ||
                        thesis.supervisor.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || thesis.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || thesis.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetails = (thesis: any) => {
    setSelectedThesis(thesis);
    setIsModalVisible(true);
  };

  const handleApprove = async (values: any) => {
    try {
      // TODO: API call để duyệt đề tài
      console.log('Approving thesis:', selectedThesis.id, values);
      message.success('Đề tài đã được duyệt thành công!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi duyệt đề tài!');
    }
  };

  const handleReject = async (values: any) => {
    try {
      // TODO: API call để từ chối đề tài
      console.log('Rejecting thesis:', selectedThesis.id, values);
      message.success('Đề tài đã được từ chối!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi từ chối đề tài!');
    }
  };

  const columns = [
    {
      title: 'Đề tài',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (text: string, record: any) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            SV: {record.student} ({record.studentId})
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            GVHD: {record.supervisor}
          </Text>
        </div>
      ),
    },
    {
      title: 'Khoa/Bộ môn',
      dataIndex: 'department',
      key: 'department',
      width: '20%',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submittedDate',
      key: 'submittedDate',
      width: '12%',
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: '12%',
      render: (priority: string) => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
        const text = priority === 'high' ? 'Cao' : priority === 'medium' ? 'Trung bình' : 'Thấp';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: string) => {
        const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
        const text = status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '9%',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  const getStatusStats = () => {
    const pending = mockTheses.filter(t => t.status === 'pending').length;
    const approved = mockTheses.filter(t => t.status === 'approved').length;
    const rejected = mockTheses.filter(t => t.status === 'rejected').length;
    return { pending, approved, rejected };
  };

  const stats = getStatusStats();

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Title level={2} style={{ margin: 0, color: '#ff6b35' }}>
              Duyệt đề tài khóa luận
            </Title>
            <Text type="secondary">
              Xem xét và đánh giá các đề tài khóa luận tốt nghiệp
            </Text>
          </div>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Chờ duyệt"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đã duyệt"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Từ chối"
                  value={stats.rejected}
                  prefix={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Input
                  placeholder="Tìm kiếm đề tài, sinh viên, giảng viên..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="Trạng thái"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="Độ ưu tiên"
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="high">Cao</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="low">Thấp</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10}>
                <Space>
                  <Button icon={<FilterOutlined />}>
                    Lọc nâng cao
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchText('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredTheses}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} đề tài`,
              }}
            />
          </Card>
        </div>
      </Content>

      {/* Modal chi tiết đề tài */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ color: '#ff6b35', marginRight: '8px' }} />
            <span>Chi tiết đề tài</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        footer={null}
      >
        {selectedThesis && (
          <div>
            {/* Thông tin cơ bản */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={4} style={{ color: '#ff6b35' }}>{selectedThesis.title}</Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Sinh viên: </Text>
                  <Text>{selectedThesis.student} ({selectedThesis.studentId})</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Giảng viên hướng dẫn: </Text>
                  <Text>{selectedThesis.supervisor}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Khoa/Bộ môn: </Text>
                  <Text>{selectedThesis.department}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Ngày nộp: </Text>
                  <Text>{selectedThesis.submittedDate}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Điểm đạo văn: </Text>
                  <Text style={{ color: selectedThesis.plagiarismScore < 10 ? '#52c41a' : '#faad14' }}>
                    {selectedThesis.plagiarismScore}%
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái: </Text>
                  <Tag color={selectedThesis.status === 'approved' ? 'green' : selectedThesis.status === 'rejected' ? 'red' : 'orange'}>
                    {selectedThesis.status === 'approved' ? 'Đã duyệt' : selectedThesis.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Tóm tắt */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Tóm tắt đề tài</Title>
              <Text>{selectedThesis.abstract}</Text>
            </Card>

            {/* Mục tiêu */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Mục tiêu nghiên cứu</Title>
              <ul>
                {selectedThesis.objectives.map((obj: string, index: number) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </Card>

            {/* Phương pháp */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Phương pháp nghiên cứu</Title>
              <Text>{selectedThesis.methodology}</Text>
            </Card>

            {/* Kết quả mong đợi */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Kết quả mong đợi</Title>
              <Text>{selectedThesis.expectedResults}</Text>
            </Card>

            {/* Lịch sử duyệt */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Title level={5}>Lịch sử duyệt</Title>
              {selectedThesis.reviewers.map((reviewer: any, index: number) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <Text strong>{reviewer.name}: </Text>
                  <Tag color={reviewer.status === 'approved' ? 'green' : reviewer.status === 'rejected' ? 'red' : 'orange'}>
                    {reviewer.status === 'approved' ? 'Đã duyệt' : reviewer.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </Tag>
                  {reviewer.date && <Text type="secondary" style={{ marginLeft: '8px' }}>({reviewer.date})</Text>}
                </div>
              ))}
            </Card>

            <Divider />

            {/* Form đánh giá */}
            {selectedThesis.status === 'pending' && (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="decision"
                  label="Quyết định"
                  rules={[{ required: true, message: 'Vui lòng chọn quyết định!' }]}
                >
                  <Select placeholder="Chọn quyết định">
                    <Option value="approve">Duyệt đề tài</Option>
                    <Option value="reject">Từ chối đề tài</Option>
                    <Option value="request_revision">Yêu cầu chỉnh sửa</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="comment"
                  label="Nhận xét"
                  rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                >
                  <TextArea rows={4} placeholder="Nhập nhận xét chi tiết về đề tài..." />
                </Form.Item>

                <Form.Item
                  name="suggestions"
                  label="Gợi ý cải thiện (tùy chọn)"
                >
                  <TextArea rows={3} placeholder="Đưa ra các gợi ý để cải thiện đề tài..." />
                </Form.Item>

                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setIsModalVisible(false)}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => form.validateFields().then(handleReject)}
                    >
                      Từ chối
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => form.validateFields().then(handleApprove)}
                    >
                      Duyệt đề tài
                    </Button>
                  </Space>
                </div>
              </Form>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </Layout>
  );
}
