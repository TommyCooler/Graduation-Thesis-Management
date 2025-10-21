'use client';
import { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, DatePicker, Select, Table, Tag, Row, Col, Space, Modal, message, Divider } from 'antd';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import dayjs from 'dayjs';
import type { TableProps } from 'antd/es/table';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Interface for Council Create Request (matches your backend)
interface CouncilCreateRequest {
  semester: string;
  date: string;
  topicId: number;
}

// Interface for Council Member Response
interface CouncilMemberResponse {
  id: number;
  name: string;
  role: string;
  email: string;
}

// Interface for Topic (for dropdown selection)
interface Topic {
  id: number;
  title: string;
  studentName: string;
  studentId: string;
  supervisorName: string;
  status: string;
}

// Interface for Council Response (matches your backend)
interface CouncilResponse {
  id: number;
  councilName: string;
  semester: string;
  date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  slot: number;
  councilMembers: CouncilMemberResponse[];
  topicName: string;
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API Service functions
const councilService = {
  // Create new council
  createCouncil: async (councilData: CouncilCreateRequest): Promise<CouncilResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/councils`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(councilData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get all councils
  getAllCouncils: async (): Promise<CouncilResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/councils`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Delete council
  deleteCouncil: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/councils/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  // Get available topics for council creation
  getAvailableTopics: async (): Promise<Topic[]> => {
    const response = await fetch(`${API_BASE_URL}/api/topics/available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

export default function CouncilPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [councils, setCouncils] = useState<CouncilResponse[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilResponse | null>(null);

  // Mock data for topics
  const mockTopics: Topic[] = [
    {
      id: 1,
      title: "Nghiên cứu và phát triển hệ thống quản lý đồ án tốt nghiệp",
      studentName: "Nguyễn Văn A",
      studentId: "SE140001",
      supervisorName: "TS. Trần Văn B",
      status: "APPROVED"
    },
    {
      id: 2,
      title: "Xây dựng ứng dụng mobile quản lý thư viện",
      studentName: "Lê Thị C",
      studentId: "SE140002",
      supervisorName: "ThS. Phạm Văn D",
      status: "APPROVED"
    },
    {
      id: 3,
      title: "Phát triển hệ thống e-commerce với ReactJS",
      studentName: "Hoàng Văn E",
      studentId: "SE140003",
      supervisorName: "TS. Nguyễn Thị F",
      status: "APPROVED"
    }
  ];
  // Mock data for councils
  const mockCouncils: CouncilResponse[] = [
    {
      id: 1,
      councilName: "Hội đồng bảo vệ khóa luận - Đợt 1",
      semester: "Fall 2024",
      date: "2024-12-15",
      status: "SCHEDULED",
      slot: 1,
      councilMembers: [
        { id: 1, name: "TS. Trần Văn A", role: "Chủ tịch", email: "trana@fpt.edu.vn" },
        { id: 2, name: "ThS. Nguyễn Văn B", role: "Thành viên", email: "nguyenb@fpt.edu.vn" },
        { id: 3, name: "ThS. Lê Thị C", role: "Thư ký", email: "lec@fpt.edu.vn" }
      ],
      topicName: "Nghiên cứu và phát triển hệ thống quản lý đồ án tốt nghiệp"
    },
    {
      id: 2,
      councilName: "Hội đồng bảo vệ khóa luận - Đợt 2",
      semester: "Fall 2024", 
      date: "2024-12-16",
      status: "COMPLETED",
      slot: 2,
      councilMembers: [
        { id: 4, name: "TS. Phạm Văn D", role: "Chủ tịch", email: "phamd@fpt.edu.vn" },
        { id: 5, name: "ThS. Hoàng Văn E", role: "Thành viên", email: "hoange@fpt.edu.vn" },
        { id: 6, name: "ThS. Trần Thị F", role: "Thư ký", email: "tranf@fpt.edu.vn" }
      ],
      topicName: "Xây dựng ứng dụng mobile quản lý thư viện"
    }
  ];

  // Load initial data
  useEffect(() => {
    setTopics(mockTopics);
    setCouncils(mockCouncils);
  }, []);  // Handle form submission
  const handleCreateCouncil = async (values: CouncilCreateRequest) => {
    setLoading(true);
    try {
      // Actual API call (uncomment when backend is ready)
      // const newCouncil = await councilService.createCouncil(values);
      // setCouncils([...councils, newCouncil]);
      
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedTopic = topics.find(topic => topic.id === values.topicId);
      if (!selectedTopic) {
        message.error('Không tìm thấy đề tài!');
        return;
      }

      const newCouncil: CouncilResponse = {
        id: councils.length + 1,
        councilName: `Hội đồng bảo vệ khóa luận - ${selectedTopic.studentName}`,
        semester: values.semester,
        date: values.date,
        status: 'SCHEDULED',
        slot: councils.length + 1,
        councilMembers: [],
        topicName: selectedTopic.title
      };

      setCouncils([...councils, newCouncil]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Tạo hội đồng khóa luận thành công!');
    } catch (error) {
      console.error('Error creating council:', error);
      message.error('Có lỗi xảy ra khi tạo hội đồng!');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete council
  const handleDeleteCouncil = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa hội đồng',
      content: 'Bạn có chắc chắn muốn xóa hội đồng này?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => {
        setCouncils(councils.filter(council => council.id !== id));
        message.success('Xóa hội đồng thành công!');
      }
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'SCHEDULED': return 'Đã lên lịch';
      case 'IN_PROGRESS': return 'Đang diễn ra';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };
  // Table columns
  const columns: TableProps<CouncilResponse>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên hội đồng',
      dataIndex: 'councilName',
      key: 'councilName',
      render: (councilName: string) => (
        <div className="font-medium text-gray-900">{councilName}</div>
      ),
    },
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester: string) => (
        <Tag color="purple">{semester}</Tag>
      ),
    },
    {
      title: 'Ngày bảo vệ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Đề tài',
      dataIndex: 'topicName',
      key: 'topicName',
      render: (topicName: string) => (
        <div className="font-medium text-gray-900">{topicName}</div>
      ),
    },
    {
      title: 'Slot',
      dataIndex: 'slot',
      key: 'slot',
      render: (slot: number) => (
        <Tag color="blue">Slot {slot}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thành viên',
      dataIndex: 'councilMembers',
      key: 'councilMembers',
      render: (members: CouncilMemberResponse[]) => (
        <div>
          {members.length} thành viên
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: CouncilResponse) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setSelectedCouncil(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDeleteCouncil(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content>
        {/* Banner */}
        <div className="bg-gradient-to-br from-blue-50 to-white py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <Title level={1} className="text-4xl mb-4">
              Quản lý <span className="text-blue-600">Hội đồng khóa luận</span>
            </Title>
            <Paragraph className="text-base text-gray-600 mb-0">
              Tạo và quản lý hội đồng bảo vệ khóa luận tốt nghiệp
            </Paragraph>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-10 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {/* Statistics Cards */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex justify-center items-center mx-auto mb-3">
                    <TeamOutlined className="text-2xl text-blue-600" />
                  </div>
                  <Text className="text-2xl font-bold text-gray-900">{councils.length}</Text>
                  <div className="text-gray-500">Tổng hội đồng</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex justify-center items-center mx-auto mb-3">
                    <CalendarOutlined className="text-2xl text-orange-600" />
                  </div>
                  <Text className="text-2xl font-bold text-gray-900">
                    {councils.filter(c => c.status === 'SCHEDULED').length}
                  </Text>
                  <div className="text-gray-500">Đã lên lịch</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex justify-center items-center mx-auto mb-3">
                    <BookOutlined className="text-2xl text-green-600" />
                  </div>
                  <Text className="text-2xl font-bold text-gray-900">
                    {councils.filter(c => c.status === 'COMPLETED').length}
                  </Text>
                  <div className="text-gray-500">Hoàn thành</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex justify-center items-center mx-auto mb-3">
                    <DeleteOutlined className="text-2xl text-red-600" />
                  </div>
                  <Text className="text-2xl font-bold text-gray-900">
                    {topics.length - councils.length}
                  </Text>
                  <div className="text-gray-500">Chưa có hội đồng</div>
                </Card>
              </Col>
            </Row>

            {/* Action Button */}
            <Card bordered={false} className="mb-6">
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3} className="mb-2">Danh sách hội đồng khóa luận</Title>
                  <Paragraph className="text-gray-600 mb-0">
                    Quản lý và theo dõi các hội đồng bảo vệ khóa luận
                  </Paragraph>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsModalVisible(true)}
                    className="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                  >
                    Tạo hội đồng mới
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Councils Table */}
            <Card bordered={false}>
              <Table
                columns={columns}
                dataSource={councils}
                rowKey="id"
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total) => `Tổng số: ${total} hội đồng`
                }}
              />
            </Card>
          </div>
        </div>
      </Content>

      {/* Create Council Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <TeamOutlined className="mr-2 text-blue-600" />
            Tạo hội đồng khóa luận mới
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCouncil}
          size="large"
        >
          <Form.Item
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
          >
            <Select placeholder="Chọn học kỳ">
              <Option value="Spring 2024">Spring 2024</Option>
              <Option value="Summer 2024">Summer 2024</Option>
              <Option value="Fall 2024">Fall 2024</Option>
              <Option value="Spring 2025">Spring 2025</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày bảo vệ"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bảo vệ!' }]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              placeholder="Chọn ngày bảo vệ"
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="topicId"
            label="Đề tài khóa luận"
            rules={[{ required: true, message: 'Vui lòng chọn đề tài!' }]}
          >
            <Select 
              placeholder="Chọn đề tài khóa luận"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {topics.map(topic => (
                <Option key={topic.id} value={topic.id}>
                  <div>
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-sm text-gray-500">
                      {topic.studentName} ({topic.studentId}) - GVHD: {topic.supervisorName}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
              >
                Tạo hội đồng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Council Detail Modal */}
      <Modal
        title="Chi tiết hội đồng"
        open={!!selectedCouncil}
        onCancel={() => setSelectedCouncil(null)}
        footer={
          <Button onClick={() => setSelectedCouncil(null)}>
            Đóng
          </Button>
        }
        width={700}
      >
        {selectedCouncil && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text className="text-gray-500">Học kỳ</Text>
                  <div className="font-medium">{selectedCouncil.semester}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text className="text-gray-500">Ngày bảo vệ</Text>
                  <div className="font-medium">{dayjs(selectedCouncil.date).format('DD/MM/YYYY')}</div>
                </div>
              </Col>
            </Row>
              <div className="border rounded-lg p-4">
              <Text className="text-gray-500 block mb-2">Đề tài khóa luận</Text>
              <div className="font-medium text-lg mb-2">{selectedCouncil.topicName}</div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text className="text-gray-500">Trạng thái</Text>
                  <div>
                    <Tag color={getStatusColor(selectedCouncil.status)} className="mt-1">
                      {getStatusText(selectedCouncil.status)}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="border rounded-lg p-4">
                  <Text className="text-gray-500">Slot</Text>
                  <div className="font-medium">Slot {selectedCouncil.slot}</div>
                </div>
              </Col>
            </Row>

            <div className="border rounded-lg p-4">
              <Text className="text-gray-500 block mb-2">Thành viên hội đồng</Text>
              {selectedCouncil.councilMembers.length > 0 ? (
                <div className="space-y-2">
                  {selectedCouncil.councilMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                      <Tag color={member.role === 'Chủ tịch' ? 'red' : member.role === 'Thư ký' ? 'blue' : 'green'}>
                        {member.role}
                      </Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Chưa có thành viên nào được phân công</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </Layout>
  );
}