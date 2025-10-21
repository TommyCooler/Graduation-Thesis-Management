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
  Avatar,
  Tooltip,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  UserAddOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Định nghĩa kiểu dữ liệu cho đề tài đã duyệt
interface ApprovedThesis {
  id: number;
  title: string;
  student: string;
  studentId: string;
  supervisor: string;
  department: string;
  approvedDate: string;
  status: 'approved' | 'in_progress' | 'completed';
  abstract: string;
  objectives: string[];
  methodology: string;
  expectedResults: string;
  plagiarismScore: number;
  committeeMembers: { name: string; role: string; department: string }[];
  hodParticipation: {
    isParticipating: boolean;
    role: string;
    joinedDate: string | null;
    notes: string;
  };
}

// Mock data cho danh sách đề tài đã duyệt
const mockApprovedTheses: ApprovedThesis[] = [
  {
    id: 1,
    title: 'Hệ thống quản lý thư viện số sử dụng AI và Machine Learning',
    student: 'Nguyễn Văn A',
    studentId: 'SE123456',
    supervisor: 'ThS. Trần Thị B',
    department: 'Khoa Công nghệ thông tin',
    approvedDate: '2024-01-20',
    status: 'in_progress',
    abstract: 'Đề tài nghiên cứu về việc ứng dụng trí tuệ nhân tạo và machine learning trong việc quản lý thư viện số, giúp tự động hóa quy trình phân loại, tìm kiếm và đề xuất tài liệu cho người dùng.',
    objectives: [
      'Xây dựng hệ thống quản lý thư viện số hiện đại',
      'Ứng dụng AI để phân loại và tìm kiếm tài liệu',
      'Phát triển thuật toán đề xuất tài liệu phù hợp',
      'Tối ưu hóa trải nghiệm người dùng',
    ],
    methodology: 'Sử dụng các thuật toán machine learning như Random Forest, Neural Networks và Natural Language Processing để phân tích và phân loại tài liệu.',
    expectedResults: 'Hệ thống có khả năng phân loại tài liệu với độ chính xác trên 90% và đề xuất tài liệu phù hợp với sở thích người dùng.',
    plagiarismScore: 15.2,
    committeeMembers: [
      { name: 'TS. Nguyễn Văn C', role: 'Chủ tịch hội đồng', department: 'Khoa CNTT' },
      { name: 'ThS. Lê Thị D', role: 'Thành viên', department: 'Khoa CNTT' },
    ],
    hodParticipation: {
      isParticipating: false,
      role: '',
      joinedDate: null,
      notes: '',
    },
  },
  {
    id: 2,
    title: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
    student: 'Hoàng Thị E',
    studentId: 'SE123458',
    supervisor: 'ThS. Nguyễn Văn F',
    department: 'Khoa Công nghệ thông tin',
    approvedDate: '2024-01-18',
    status: 'in_progress',
    abstract: 'Xây dựng hệ thống IoT để giám sát và điều khiển tự động các yếu tố môi trường trong nông nghiệp như độ ẩm, nhiệt độ, ánh sáng và dinh dưỡng đất.',
    objectives: [
      'Thiết kế hệ thống cảm biến IoT',
      'Phát triển ứng dụng điều khiển tự động',
      'Tối ưu hóa năng suất cây trồng',
      'Giảm thiểu tác động môi trường',
    ],
    methodology: 'Sử dụng các cảm biến IoT, microcontrollers và machine learning để phân tích dữ liệu và đưa ra quyết định tự động.',
    expectedResults: 'Tăng năng suất cây trồng 20-30% và giảm 40% lượng nước tưới so với phương pháp truyền thống.',
    plagiarismScore: 5.8,
    committeeMembers: [
      { name: 'TS. Phạm Văn G', role: 'Chủ tịch hội đồng', department: 'Khoa CNTT' },
      { name: 'ThS. Trần Thị H', role: 'Thành viên', department: 'Khoa CNTT' },
    ],
    hodParticipation: {
      isParticipating: true,
      role: 'Cố vấn chuyên môn',
      joinedDate: '2024-01-22',
      notes: 'Tham gia với vai trò cố vấn về kỹ thuật IoT và machine learning',
    },
  },
  {
    id: 3,
    title: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản',
    student: 'Lê Văn C',
    studentId: 'SE123457',
    supervisor: 'TS. Phạm Thị D',
    department: 'Khoa Công nghệ thông tin',
    approvedDate: '2024-01-19',
    status: 'completed',
    abstract: 'Nghiên cứu ứng dụng công nghệ blockchain để tạo ra hệ thống minh bạch và đáng tin cậy trong quản lý chuỗi cung ứng nông sản từ sản xuất đến tiêu dùng.',
    objectives: [
      'Xây dựng hệ thống blockchain cho chuỗi cung ứng',
      'Đảm bảo tính minh bạch và truy xuất nguồn gốc',
      'Tối ưu hóa quy trình logistics',
      'Tăng cường niềm tin của người tiêu dùng',
    ],
    methodology: 'Sử dụng Ethereum blockchain, smart contracts và IoT sensors để theo dõi và ghi lại thông tin sản phẩm tại mỗi bước trong chuỗi cung ứng.',
    expectedResults: 'Hệ thống có thể theo dõi 100% sản phẩm từ nông trại đến người tiêu dùng với thời gian phản hồi dưới 5 giây.',
    plagiarismScore: 8.5,
    committeeMembers: [
      { name: 'TS. Nguyễn Văn I', role: 'Chủ tịch hội đồng', department: 'Khoa CNTT' },
      { name: 'ThS. Lê Thị J', role: 'Thành viên', department: 'Khoa CNTT' },
    ],
    hodParticipation: {
      isParticipating: true,
      role: 'Giám sát dự án',
      joinedDate: '2024-01-21',
      notes: 'Tham gia giám sát tiến độ và chất lượng dự án',
    },
  },
];

export default function HeadOfDepartmentPage() {
  const [selectedThesis, setSelectedThesis] = useState<ApprovedThesis | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState('all');

  // Filter data based on search and filters
  const filteredTheses = mockApprovedTheses.filter((thesis) => {
    const matchesSearch =
      thesis.title.toLowerCase().includes(searchText.toLowerCase()) ||
      thesis.student.toLowerCase().includes(searchText.toLowerCase()) ||
      thesis.supervisor.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || thesis.status === statusFilter;
    const matchesParticipation = 
      participationFilter === 'all' || 
      (participationFilter === 'participating' && thesis.hodParticipation.isParticipating) ||
      (participationFilter === 'not_participating' && !thesis.hodParticipation.isParticipating);

    return matchesSearch && matchesStatus && matchesParticipation;
  });

  const handleViewDetails = (thesis: ApprovedThesis) => {
    setSelectedThesis(thesis);
    setIsModalVisible(true);
  };

  const handleJoinThesis = async (thesis: ApprovedThesis) => {
    try {
      const API_BASE = process.env.TOPIC_API_BASE_URL || 'http://localhost:8083';
      const token = localStorage.getItem('access_token');
      
      const res = await fetch(`${API_BASE}/topic-approval-service/api/review-councils/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: thesis.id,
        }),
      });

      const data = await res.json();
      
      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      message.success('Đã tham gia hội đồng duyệt thành công!');
      // TODO: Refresh data
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tham gia hội đồng!');
    }
  };

  const handleLeaveThesis = async (thesisId: number) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('access_token');
      
      const res = await fetch(`${API_BASE}/topic-approval-service/api/review-councils/leave/${thesisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      message.success('Đã rời khỏi hội đồng duyệt!');
      // TODO: Refresh data
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi rời khỏi hội đồng!');
    }
  };

  const columns = [
    {
      title: 'Đề tài',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (text: string, record: ApprovedThesis) => (
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
      width: '15%',
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'approvedDate',
      key: 'approvedDate',
      width: '12%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: 'approved' | 'in_progress' | 'completed') => {
        const color = status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'orange';
        const text = status === 'completed' ? 'Hoàn thành' : status === 'in_progress' ? 'Đang thực hiện' : 'Đã duyệt';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Tham gia',
      key: 'participation',
      width: '15%',
      render: (_: any, record: ApprovedThesis) => (
        <div>
          {record.hodParticipation.isParticipating ? (
            <div>
              <Tag color="green" icon={<UserOutlined />}>
                Đã tham gia
              </Tag>
              <br />
              <Text type="secondary" className="text-xs">
                {record.hodParticipation.role}
              </Text>
            </div>
          ) : (
            <Tag color="default">Chưa tham gia</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '16%',
      render: (_: any, record: ApprovedThesis) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Xem chi tiết
          </Button>
          {record.hodParticipation.isParticipating ? (
          <Button
            type="default"
            danger
            icon={<UserOutlined />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận rời khỏi hội đồng',
                content: 'Bạn có chắc muốn rời khỏi hội đồng duyệt này?',
                okText: 'Rời khỏi',
                cancelText: 'Hủy',
                onOk: () => handleLeaveThesis(record.id),
              });
            }}
          >
            Rời khỏi
          </Button>
          ) : (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size="small"
              onClick={() => handleJoinThesis(record)}
              className="bg-[#ff6b35] border-[#ff6b35]"
            >
              Tham gia
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Thống kê
  const totalTheses = mockApprovedTheses.length;
  const participatingTheses = mockApprovedTheses.filter(t => t.hodParticipation.isParticipating).length;
  const completedTheses = mockApprovedTheses.filter(t => t.status === 'completed').length;
  const inProgressTheses = mockApprovedTheses.filter(t => t.status === 'in_progress').length;

  return (
    <Layout className="min-h-screen">
      <Header />

      <Content className="p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#fff5f0] to-white p-6 rounded-xl mb-6 shadow-md">
            <Title level={2} className="m-0 text-[#ff6b35]">
              Dashboard - Trưởng Bộ Môn
            </Title>
            <Text type="secondary">Quản lý và tham gia các đề tài đã được duyệt</Text>
          </div>

          {/* Statistics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng đề tài"
                  value={totalTheses}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đã tham gia"
                  value={participatingTheses}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang thực hiện"
                  value={inProgressTheses}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={completedTheses}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

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
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="in_progress">Đang thực hiện</Option>
                  <Option value="completed">Hoàn thành</Option>
                </Select>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="Tham gia"
                  value={participationFilter}
                  onChange={setParticipationFilter}
                  className="w-full"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="participating">Đã tham gia</Option>
                  <Option value="not_participating">Chưa tham gia</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10}>
                <Space>
                  <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
                  <Button
                    onClick={() => {
                      setSearchText('');
                      setStatusFilter('all');
                      setParticipationFilter('all');
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
                  <Text strong>Ngày duyệt: </Text>
                  <Text>{selectedThesis.approvedDate}</Text>
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
                      selectedThesis.status === 'completed'
                        ? 'green'
                        : selectedThesis.status === 'in_progress'
                          ? 'blue'
                          : 'orange'
                    }
                  >
                    {selectedThesis.status === 'completed' ? 'Hoàn thành' : selectedThesis.status === 'in_progress' ? 'Đang thực hiện' : 'Đã duyệt'}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Thông tin tham gia */}
            <Card size="small" className="mb-4">
              <Title level={5}>Thông tin tham gia</Title>
              {selectedThesis.hodParticipation.isParticipating ? (
                <div>
                  <Text strong>Vai trò: </Text>
                  <Text>{selectedThesis.hodParticipation.role}</Text>
                  <br />
                  <Text strong>Ngày tham gia: </Text>
                  <Text>{selectedThesis.hodParticipation.joinedDate}</Text>
                  <br />
                  <Text strong>Ghi chú: </Text>
                  <Text>{selectedThesis.hodParticipation.notes}</Text>
                </div>
              ) : (
                <Text type="secondary">Chưa tham gia đề tài này</Text>
              )}
            </Card>

            {/* Hội đồng */}
            <Card size="small" className="mb-4">
              <Title level={5}>Thành viên hội đồng</Title>
              {selectedThesis.committeeMembers.map((member, index) => (
                <div key={index} className="mb-2">
                  <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
                  <Text strong>{member.name}</Text>
                  <Tag color="blue" className="ml-2">{member.role}</Tag>
                  <br />
                  <Text type="secondary" className="ml-6">{member.department}</Text>
                </div>
              ))}
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
          </div>
        )}
      </Modal>

      <Footer />
    </Layout>
  );
}
