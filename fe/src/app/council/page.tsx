'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Button, Input, message, Pagination, Divider, Form, Tag, Spin, Modal, Descriptions, Badge } from 'antd';
import { TeamOutlined, BookOutlined, CheckCircleOutlined, FileTextOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Topic } from '../../types/topic';
import { CouncilCreateRequest, CouncilResponse } from '../../types/council';
import { topicService } from '../../services/topicService';
import { councilService } from '../../services/councilService';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const CouncilPage: React.FC = () => {
  const [form] = Form.useForm();
  const [semester, setSemester] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [createdCouncil, setCreatedCouncil] = useState<CouncilResponse | null>(null);
  const [showCouncilDetails, setShowCouncilDetails] = useState(false);
  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, [currentPage]);

  const fetchTopics = async () => {
    setLoading(true);
    try {      const response = await topicService.getAllTopics({}, currentPage - 1, 10);
      setTopics(response.topics);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching topics:', error);
      messageApi.error('Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { semester: string }) => {
    if (!selectedTopicId) {
      messageApi.error('Vui lòng chọn đề tài');
      return;
    }

    setCreating(true);
    try {      const request: CouncilCreateRequest = {
        semester: values.semester,
        topicId: selectedTopicId
      };

      const council = await councilService.createCouncil(request);
      setCreatedCouncil(council);
      setShowCouncilDetails(true);
      messageApi.success('Thành lập hội đồng thành công!');
      
      // Reset form
      form.resetFields();
      setSelectedTopicId(null);
    } catch (error) {
      console.error('Error creating council:', error);
      messageApi.error('Có lỗi xảy ra khi thành lập hội đồng');
    } finally {
      setCreating(false);
    }
  };

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopicId(topicId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'REJECTED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };
  return (
    <Layout className="min-h-screen">
      {contextHolder}
      <Header />
      
      <Content>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-50 to-white py-20 px-6 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <TeamOutlined className="text-4xl text-white" />
            </div>
            <Title level={1} className="text-5xl mb-6">
              Thành lập <span className="text-orange-500">Hội đồng</span> Bảo vệ
            </Title>
            <Paragraph className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto">
              Tạo hội đồng bảo vệ luận văn tốt nghiệp với quy trình chuyên nghiệp
            </Paragraph>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <Row gutter={[32, 32]}>
              {/* Form Section */}
              <Col xs={24} lg={10}>
                <Card
                  title={
                    <div className="flex items-center">
                      <FileTextOutlined className="text-orange-500 mr-2" />
                      <span>Thông tin Hội đồng</span>
                    </div>
                  }
                  className="h-full"
                  styles={{ body: { padding: '24px' } }}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="space-y-4"
                  >
                    <Form.Item
                      name="semester"
                      label="Học kỳ"
                      rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
                    >
                      <Input
                        placeholder="VD: Fall 2024, Spring 2025..."
                        size="large"
                      />
                    </Form.Item>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đề tài được chọn <span className="text-red-500">*</span>
                      </label>
                      <Card
                        size="small"
                        className={selectedTopicId ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}
                        styles={{ body: { padding: '12px' } }}
                      >
                        {selectedTopicId ? (
                          <div>
                            <div className="flex items-center mb-2">
                              <CheckCircleOutlined className="text-orange-500 mr-2" />
                              <span className="font-medium text-orange-600">
                                ID: {selectedTopicId}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {topics.find(t => t.id === selectedTopicId)?.title || 'Đang tải...'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic text-center py-2">
                            Chưa chọn đề tài - Vui lòng chọn từ danh sách bên phải
                          </p>
                        )}
                      </Card>
                    </div>

                    <Form.Item className="mt-6">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={creating}
                        disabled={!selectedTopicId}
                        size="large"
                        className="w-full bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                      >
                        {creating ? 'Đang thành lập...' : 'Thành lập Hội đồng'}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              {/* Topics List Section */}
              <Col xs={24} lg={14}>
                <Card
                  title={
                    <div className="flex items-center">
                      <BookOutlined className="text-orange-500 mr-2" />
                      <span>Danh sách Đề tài</span>
                    </div>
                  }
                  className="h-full"
                  styles={{ body: { padding: '24px' } }}
                >
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.length > 0 ? (
                        topics.map((topic) => (
                          <Card
                            key={topic.id}
                            size="small"
                            hoverable
                            onClick={() => handleTopicSelect(topic.id)}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedTopicId === topic.id
                                ? 'border-orange-400 shadow-md bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                            }`}
                            styles={{ body: { padding: '16px' } }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <Title level={5} className="mb-0 text-gray-800">
                                    {topic.title}
                                  </Title>
                                  {selectedTopicId === topic.id && (
                                    <CheckCircleOutlined className="text-orange-500 text-lg" />
                                  )}
                                </div>
                                <Paragraph
                                  className="text-gray-600 mb-3"
                                  ellipsis={{ rows: 2 }}
                                >
                                  {topic.description}
                                </Paragraph>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    ID: {topic.id}
                                  </span>
                                  <Tag color={getStatusColor(topic.status)}>
                                    {getStatusText(topic.status)}
                                  </Tag>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <BookOutlined className="text-6xl text-gray-300 mb-4" />
                          <Title level={4} className="text-gray-500">
                            Không có đề tài nào
                          </Title>
                          <Paragraph className="text-gray-400">
                            Hiện tại chưa có đề tài nào trong hệ thống
                          </Paragraph>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination
                        current={currentPage}
                        total={totalItems}
                        pageSize={10}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) => 
                          `${range[0]}-${range[1]} của ${total} đề tài`
                        }
                      />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Info Section */}
        <div className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <Title level={2} className="text-center mb-15">
              Quy trình thành lập Hội đồng
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Chọn học kỳ
                  </Title>
                  <Paragraph className="text-gray-600">
                    Xác định học kỳ cần thành lập hội đồng bảo vệ luận văn
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Chọn đề tài
                  </Title>
                  <Paragraph className="text-gray-600">
                    Lựa chọn đề tài cần thành lập hội đồng từ danh sách có sẵn
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TeamOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Thành lập hội đồng
                  </Title>
                  <Paragraph className="text-gray-600">
                    Hệ thống tự động tạo hội đồng với các thành viên phù hợp
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>      <Divider className="my-0" />
      <Footer />

      {/* Council Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <TeamOutlined className="text-orange-500 mr-2" />
            <span>Chi tiết Hội đồng vừa tạo</span>
          </div>
        }
        open={showCouncilDetails}
        onCancel={() => setShowCouncilDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowCouncilDetails(false)}>
            Đóng
          </Button>,
          <Button 
            key="view-list" 
            type="primary" 
            className="bg-orange-500 hover:bg-orange-600 border-orange-500"
            onClick={() => {
              setShowCouncilDetails(false);
              // Navigate to council list page if exists
              // router.push('/councils');
            }}
          >
            Xem danh sách hội đồng
          </Button>
        ]}
        width={800}
      >
        {createdCouncil && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card size="small" title="Thông tin cơ bản">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Tên hội đồng" span={2}>
                  <strong>{createdCouncil.councilName}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Học kỳ">
                  {createdCouncil.semester}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày">
                  <CalendarOutlined className="mr-1" />
                  {councilService.formatDate(createdCouncil.date)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge 
                    status={councilService.getStatusColor(createdCouncil.status) as any}
                    text={councilService.getStatusDisplay(createdCouncil.status)}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Slot">
                  <ClockCircleOutlined className="mr-1" />
                  Slot {createdCouncil.slot}
                </Descriptions.Item>
                <Descriptions.Item label="Đề tài" span={2}>
                  <Tag color="blue">{createdCouncil.topicName}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Council Members */}
            <Card size="small" title="Thành viên hội đồng">
              <div className="space-y-3">
                {createdCouncil.councilMembers.map((member) => (
                  <Card
                    key={member.id}
                    size="small"
                    className="bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserOutlined className="text-gray-500" />
                        <div>
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-sm text-gray-500">{member.phoneNumber}</div>
                        </div>
                      </div>
                      <Tag color={councilService.getRoleColor(member.role)}>
                        {councilService.getRoleDisplay(member.role)}
                      </Tag>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start">
                <CheckCircleOutlined className="text-green-500 mr-2 mt-1" />
                <div>
                  <div className="font-medium text-green-800">
                    Hội đồng đã được thành lập thành công!
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    Hội đồng ID: <strong>{createdCouncil.id}</strong> đã sẵn sàng cho quá trình bảo vệ luận văn.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default CouncilPage;