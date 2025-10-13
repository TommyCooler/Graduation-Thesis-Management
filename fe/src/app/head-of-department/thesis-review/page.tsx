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
  Divider,
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
  FilterOutlined,
} from '@ant-design/icons';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Định nghĩa kiểu dữ liệu cho đề tài
interface Thesis {
  id: number;
  title: string;
  student: string;
  studentId: string;
  supervisor: string;
  department: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  abstract: string;
  objectives: string[];
  methodology: string;
  expectedResults: string;
  plagiarismScore: number;
  reviewers: { name: string; status: 'pending' | 'approved' | 'rejected'; date: string | null }[];
}

// Mock data cho danh sách đề tài
const mockTheses: Thesis[] = [
  {
    id: 1,
    title: 'Hệ thống quản lý thư viện số sử dụng AI và Machine Learning',
    student: 'Nguyễn Văn A',
    studentId: 'SE123456',
    supervisor: 'ThS. Trần Thị B',
    department: 'Khoa Công nghệ thông tin',
    submittedDate: '2024-01-15',
    status: 'pending',
    abstract: 'Đề tài nghiên cứu về việc ứng dụng trí tuệ nhân tạo và machine learning trong việc quản lý thư viện số, giúp tự động hóa quy trình phân loại, tìm kiếm và đề xuất tài liệu cho người dùng.',
    objectives: [
      'Xây dựng hệ thống quản lý thư viện số hiện đại',
      'Ứng dụng AI để phân loại và tìm kiếm tài liệu',
      'Phát triển thuật toán đề xuất tài liệu phù hợp',
      'Tối ưu hóa trải nghiệm người dùng',
    ],
    methodology:
      'Sử dụng các thuật toán machine learning như Random Forest, Neural Networks và Natural Language Processing để phân tích và phân loại tài liệu.',
    expectedResults: 'Hệ thống có khả năng phân loại tài liệu với độ chính xác trên 90% và đề xuất tài liệu phù hợp với sở thích người dùng.',
    plagiarismScore: 15.2,
    reviewers: [
      { name: 'TS. Nguyễn Văn C', status: 'approved', date: '2024-01-16' },
      { name: 'ThS. Lê Thị D', status: 'pending', date: null },
    ],
  },
  {
    id: 2,
    title: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản',
    student: 'Lê Văn C',
    studentId: 'SE123457',
    supervisor: 'TS. Phạm Thị D',
    department: 'Khoa Công nghệ thông tin',
    submittedDate: '2024-01-14',
    status: 'pending',
    abstract:
      'Nghiên cứu ứng dụng công nghệ blockchain để tạo ra hệ thống minh bạch và đáng tin cậy trong quản lý chuỗi cung ứng nông sản từ sản xuất đến tiêu dùng.',
    objectives: [
      'Xây dựng hệ thống blockchain cho chuỗi cung ứng',
      'Đảm bảo tính minh bạch và truy xuất nguồn gốc',
      'Tối ưu hóa quy trình logistics',
      'Tăng cường niềm tin của người tiêu dùng',
    ],
    methodology:
      'Sử dụng Ethereum blockchain, smart contracts và IoT sensors để theo dõi và ghi lại thông tin sản phẩm tại mỗi bước trong chuỗi cung ứng.',
    expectedResults: 'Hệ thống có thể theo dõi 100% sản phẩm từ nông trại đến người tiêu dùng với thời gian phản hồi dưới 5 giây.',
    plagiarismScore: 8.5,
    reviewers: [
      { name: 'TS. Nguyễn Văn C', status: 'approved', date: '2024-01-15' },
      { name: 'ThS. Lê Thị D', status: 'rejected', date: '2024-01-16' },
    ],
  },
  {
    id: 3,
    title: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
    student: 'Hoàng Thị E',
    studentId: 'SE123458',
    supervisor: 'ThS. Nguyễn Văn F',
    department: 'Khoa Công nghệ thông tin',
    submittedDate: '2024-01-13',
    status: 'approved',
    abstract:
      'Xây dựng hệ thống IoT để giám sát và điều khiển tự động các yếu tố môi trường trong nông nghiệp như độ ẩm, nhiệt độ, ánh sáng và dinh dưỡng đất.',
    objectives: [
      'Thiết kế hệ thống cảm biến IoT',
      'Phát triển ứng dụng điều khiển tự động',
      'Tối ưu hóa năng suất cây trồng',
      'Giảm thiểu tác động môi trường',
    ],
    methodology: 'Sử dụng các cảm biến IoT, microcontrollers và machine learning để phân tích dữ liệu và đưa ra quyết định tự động.',
    expectedResults: 'Tăng năng suất cây trồng 20-30% và giảm 40% lượng nước tưới so với phương pháp truyền thống.',
    plagiarismScore: 5.8,
    reviewers: [
      { name: 'TS. Nguyễn Văn C', status: 'approved', date: '2024-01-14' },
      { name: 'ThS. Lê Thị D', status: 'approved', date: '2024-01-15' },
    ],
  },
];

export default function ThesisReviewPage() {
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();

  // Filter data based on search and filters
  const filteredTheses = mockTheses.filter((thesis) => {
    const matchesSearch =
      thesis.title.toLowerCase().includes(searchText.toLowerCase()) ||
      thesis.student.toLowerCase().includes(searchText.toLowerCase()) ||
      thesis.supervisor.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || thesis.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setIsModalVisible(true);
  };

  const handleApprove = async (values: any) => {
    try {
      // TODO: API call để duyệt đề tài
      console.log('Approving thesis:', selectedThesis?.id, values);
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
      console.log('Rejecting thesis:', selectedThesis?.id, values);
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
      render: (text: string, record: Thesis) => (
        <div>
          <Text strong className="text-sm">{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            SV: {record.student} ({record.studentId})
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: 'pending' | 'approved' | 'rejected') => {
        const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
        const text = status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '9%',
      render: (_: any, record: Thesis) => (
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


  return (
    <Layout className="min-h-screen">
      <Header />

      <Content className="p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#fff5f0] to-white p-6 rounded-xl mb-6 shadow-md">
            <Title level={2} className="m-0 text-[#ff6b35]">
              Duyệt đề tài khóa luận
            </Title>
            <Text type="secondary">Xem xét và đánh giá các đề tài khóa luận tốt nghiệp</Text>
          </div>

          {/* Filters */}
          <Card className="mb-6">
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
                  className="w-full"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
              </Col>
            
              <Col xs={24} sm={24} md={10}>
                <Space>
                  <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
                  <Button
                    onClick={() => {
                      setSearchText('');
                      setStatusFilter('all');
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
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề tài`,
              }}
            />
          </Card>
        </div>
      </Content>

      {/* Modal chi tiết đề tài */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="text-[#ff6b35] mr-2" />
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
            <Card size="small" className="mb-4">
              <Title level={4} className="text-[#ff6b35]">
                {selectedThesis.title}
              </Title>
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
                  <Text
                    className={selectedThesis.plagiarismScore < 10 ? 'text-green-500' : 'text-yellow-500'}
                  >
                    {selectedThesis.plagiarismScore}%
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái: </Text>
                  <Tag
                    color={
                      selectedThesis.status === 'approved'
                        ? 'green'
                        : selectedThesis.status === 'rejected'
                          ? 'red'
                          : 'orange'
                    }
                  >
                    {selectedThesis.status === 'approved' ? 'Đã duyệt' : selectedThesis.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Tóm tắt */}
            <Card size="small" className="mb-4">
              <Title level={5}>Tóm tắt đề tài</Title>
              <Text>{selectedThesis.abstract}</Text>
            </Card>

            {/* Mục tiêu */}
            <Card size="small" className="mb-4">
              <Title level={5}>Mục tiêu nghiên cứu</Title>
              <ul className="list-disc list-inside">
                {selectedThesis.objectives.map((obj: string, index: number) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </Card>

            {/* Phương pháp */}
            <Card size="small" className="mb-4">
              <Title level={5}>Phương pháp nghiên cứu</Title>
              <Text>{selectedThesis.methodology}</Text>
            </Card>

            {/* Kết quả mong đợi */}
            <Card size="small" className="mb-4">
              <Title level={5}>Kết quả mong đợi</Title>
              <Text>{selectedThesis.expectedResults}</Text>
            </Card>

            {/* Lịch sử duyệt */}
            <Card size="small" className="mb-4">
              <Title level={5}>Lịch sử duyệt</Title>
              {selectedThesis.reviewers.map((reviewer: any, index: number) => (
                <div key={index} className="mb-2">
                  <Text strong>{reviewer.name}: </Text>
                  <Tag
                    color={
                      reviewer.status === 'approved'
                        ? 'green'
                        : reviewer.status === 'rejected'
                          ? 'red'
                          : 'orange'
                    }
                  >
                    {reviewer.status === 'approved' ? 'Đã duyệt' : reviewer.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                  </Tag>
                  {reviewer.date && <Text type="secondary" className="ml-2">({reviewer.date})</Text>}
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

                <div className="text-right">
                  <Space>
                    <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
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
                      className="bg-[#ff6b35] border-[#ff6b35]"
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