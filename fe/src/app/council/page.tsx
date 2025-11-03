'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Input, 
  message, 
  Pagination, 
  Divider, 
  Form, 
  Tag, 
  Spin, 
  Modal, 
  Descriptions, 
  Badge, 
  Checkbox,
  Steps,
  Statistic,
  Progress,
  Table,
  Space,
  Tooltip,
  Alert
} from 'antd';
import { 
  TeamOutlined, 
  BookOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  DashboardOutlined,
  BulbOutlined,
  RocketOutlined,
  TrophyOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Topic } from '../../types/topic';
import { CouncilCreateRequest, CouncilResponse } from '../../types/council';
import { topicService } from '../../services/topicService';
import { councilService } from '../../services/councilService';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const CouncilPage: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [createdCouncil, setCreatedCouncil] = useState<CouncilResponse | null>(null);
  const [showCouncilDetails, setShowCouncilDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, [currentPage]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const allTopics = await topicService.getAllTopicsForReviewCouncil();
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTopics = allTopics.slice(startIndex, endIndex);
      
      setTopics(paginatedTopics);
      setTotalPages(Math.ceil(allTopics.length / itemsPerPage));
      setTotalItems(allTopics.length);
    } catch (error) {
      console.error('Error fetching topics:', error);
      messageApi.error('Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { semester: string }) => {
    if (selectedTopicIds.length === 0) {
      messageApi.error('Vui lòng chọn ít nhất một đề tài');
      return;
    }

    setCreating(true);
    setCurrentStep(2);
    
    try {
      const request: CouncilCreateRequest = {
        semester: values.semester,
        topicId: selectedTopicIds
      };

      const council = await councilService.createCouncil(request);
      setCreatedCouncil(council);
      setCurrentStep(3);
      setShowCouncilDetails(true);
      messageApi.success('Thành lập hội đồng thành công!');
      
      // Reset form
      form.resetFields();
      setSelectedTopicIds([]);
      setTimeout(() => setCurrentStep(0), 3000);
    } catch (error) {
      console.error('Error creating council:', error);
      messageApi.error('Có lỗi xảy ra khi thành lập hội đồng');
      setCurrentStep(0);
    } finally {
      setCreating(false);
    }
  };

  const handleTopicSelect = (topicId: number, checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(prev => [...prev, topicId]);
      if (currentStep === 0 && selectedTopicIds.length === 0) {
        setCurrentStep(1);
      }
    } else {
      setSelectedTopicIds(prev => prev.filter(id => id !== topicId));
      if (selectedTopicIds.length === 1) {
        setCurrentStep(0);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allTopicIds = topics.map(topic => topic.id);
      setSelectedTopicIds(allTopicIds);
      setCurrentStep(1);
    } else {
      setSelectedTopicIds([]);
      setCurrentStep(0);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'PENDING': return 'orange';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'PENDING': return 'Chờ duyệt';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  // Calculate statistics
  const approvedTopics = topics.filter(t => t.status === 'APPROVED').length;
  const pendingTopics = topics.filter(t => t.status === 'PENDING').length;
  const completionRate = topics.length > 0 ? (approvedTopics / topics.length) * 100 : 0;

  const columns = [
    {
      title: '#',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Đề tài',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Topic) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-800 text-sm">{text}</div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="text-xs text-gray-600 max-w-xs">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Chọn',
      key: 'action',
      width: 60,
      render: (_: any, record: Topic) => (
        <Checkbox
          checked={selectedTopicIds.includes(record.id)}
          onChange={(e) => handleTopicSelect(record.id, e.target.checked)}
        />
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {contextHolder}
      <Header />
      
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <DashboardOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <Title level={2} className="mb-1">
                      Bảng Điều Khiển Hội Đồng
                    </Title>
                    <Text className="text-gray-600">
                      Quản lý và thành lập hội đồng bảo vệ luận văn tốt nghiệp
                    </Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<EyeOutlined />}
                  href="/council/council-list"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Xem Danh Sách
                </Button>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <Card className="mb-8 border-0 shadow-lg">
            <div className="p-4">
              <Title level={4} className="mb-6 flex items-center">
                <SettingOutlined className="mr-2 text-gray-600" />
                Quy Trình Thành Lập
              </Title>
              <Steps current={currentStep} className="mb-4">
                <Step 
                  title="Chọn Đề Tài" 
                  description="Lựa chọn các đề tài cần thành lập hội đồng"
                  icon={<BulbOutlined />}
                />
                <Step 
                  title="Nhập Thông Tin" 
                  description="Điền học kỳ và xác nhận thông tin"
                  icon={<FileTextOutlined />}
                />
                <Step 
                  title="Xử Lý" 
                  description="Hệ thống đang tạo hội đồng"
                  icon={<SettingOutlined />}
                />
                <Step 
                  title="Hoàn Thành" 
                  description="Hội đồng đã được thành lập thành công"
                  icon={<CheckCircleOutlined />}
                />
              </Steps>
              
              {selectedTopicIds.length > 0 && (
                <Alert
                  message={`Đã chọn ${selectedTopicIds.length} đề tài`}
                  description="Có thể tiếp tục chọn thêm hoặc bắt đầu tạo hội đồng"
                  type="info"
                  showIcon
                  className="mt-4"
                />
              )}
            </div>
          </Card>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            {/* Form Section */}
            <Col xs={24} xl={8}>
              <Card 
                className="border-0 shadow-lg h-full"
                title={
                  <div className="flex items-center">
                    <TeamOutlined className="text-orange-500 mr-2" />
                    <span>Thông Tin Hội Đồng</span>
                  </div>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="space-y-6"
                >
                  <Form.Item
                    name="semester"
                    label={<span className="font-semibold">Học kỳ</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
                  >
                    <Input
                      placeholder="VD: Fall 2024, Spring 2025..."
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <Text strong className="text-gray-700">Đề tài được chọn</Text>
                      <Badge count={selectedTopicIds.length} showZero color="#f59e0b" />
                    </div>
                    
                    {selectedTopicIds.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTopicIds.map(topicId => {
                          const topic = topics.find(t => t.id === topicId);
                          return (
                            <div key={topicId} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex-1">
                                <div className="text-sm font-medium">ID: {topicId}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {topic?.title || 'Đang tải...'}
                                </div>
                              </div>
                              <Button
                                type="text"
                                size="small"
                                danger
                                onClick={() => handleTopicSelect(topicId, false)}
                                className="ml-2"
                              >
                                ×
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BulbOutlined className="text-3xl mb-2" />
                        <div className="text-sm">Chưa chọn đề tài nào</div>
                      </div>
                    )}
                  </div>

                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={creating}
                      disabled={selectedTopicIds.length === 0}
                      size="large"
                      icon={<PlusOutlined />}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {creating ? 'Đang Tạo Hội Đồng...' : `Thành Lập Hội Đồng (${selectedTopicIds.length})`}
                    </Button>
                  </Form.Item>

                  {selectedTopicIds.length > 0 && (
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedTopicIds([]);
                        setCurrentStep(0);
                      }}
                      className="w-full text-red-500 hover:text-red-700"
                    >
                      Xóa Tất Cả Lựa Chọn
                    </Button>
                  )}
                </Form>
              </Card>
            </Col>

            {/* Topics Table Section */}
            <Col xs={24} xl={16}>
              <Card 
                className="border-0 shadow-lg"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOutlined className="text-blue-500 mr-2" />
                      <span>Danh Sách Đề Tài</span>
                    </div>
                    <Space>
                      <Checkbox
                        indeterminate={selectedTopicIds.length > 0 && selectedTopicIds.length < topics.length}
                        checked={topics.length > 0 && selectedTopicIds.length === topics.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <Button
                        type="default"
                        icon={<BookOutlined />}
                        onClick={fetchTopics}
                        loading={loading}
                      >
                        Làm mới
                      </Button>
                    </Space>
                  </div>
                }
              >
                <Table
                  columns={columns}
                  dataSource={topics}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  className="custom-table"
                  rowSelection={{
                    selectedRowKeys: selectedTopicIds,
                    onSelect: (record, selected) => handleTopicSelect(record.id, selected),
                    onSelectAll: (selected, selectedRows, changeRows) => {
                      const changeIds = changeRows.map(row => row.id);
                      if (selected) {
                        setSelectedTopicIds(prev => [...prev, ...changeIds]);
                      } else {
                        setSelectedTopicIds(prev => prev.filter(id => !changeIds.includes(id)));
                      }
                    },
                  }}
                  scroll={{ y: 400 }}
                />
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
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
      </Content>

      <Divider className="my-0" />
      <Footer />

      {/* Enhanced Modal */}
      <Modal
        title={null}
        open={showCouncilDetails}
        onCancel={() => setShowCouncilDetails(false)}
        footer={null}
        width={1000}
        className="council-modal"
      >
        {createdCouncil && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 -m-6 mb-6 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircleOutlined className="text-3xl text-white" />
                  </div>
                  <div>
                    <Title level={2} className="text-white mb-1">
                      🎉 Thành Lập Thành Công!
                    </Title>
                    <Text className="text-green-100 text-lg">
                      Hội đồng #{createdCouncil.id} đã sẵn sàng hoạt động
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card className="text-center border-blue-200 bg-blue-50">
                  <Statistic
                    title="ID Hội Đồng"
                    value={createdCouncil.id}
                    prefix="#"
                    valueStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="text-center border-green-200 bg-green-50">
                  <Statistic
                    title="Số Đề Tài"
                    value={createdCouncil.topic?.length || 0}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#059669', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="text-center border-orange-200 bg-orange-50">
                  <Statistic
                    title="Thành Viên"
                    value={createdCouncil.councilMembers.length}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Council Information */}
            <Card 
              title={
                <div className="flex items-center">
                  <TeamOutlined className="text-blue-500 mr-2" />
                  Thông Tin Hội Đồng
                </div>
              }
              className="border-blue-200"
            >
              <Descriptions column={2} size="middle">
                <Descriptions.Item label="Tên hội đồng" span={2}>
                  <Text strong className="text-lg">{createdCouncil.councilName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Học kỳ">
                  <Tag color="blue" className="px-3 py-1 text-sm font-medium">
                    {createdCouncil.semester}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tổ chức">
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-500" />
                    <Text>{councilService.formatDate(createdCouncil.date)}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Badge 
                    status="processing"
                    text={
                      <Text className="text-blue-600 font-medium">
                        {councilService.getStatusDisplay(createdCouncil.status)}
                      </Text>
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Topics List */}
            <Card 
              title={
                <div className="flex items-center">
                  <BookOutlined className="text-green-500 mr-2" />
                  Danh Sách Đề Tài ({createdCouncil.topic?.length || 0})
                </div>
              }
              className="border-green-200"
            >
              {createdCouncil.topic && createdCouncil.topic.length > 0 ? (
                <div className="grid gap-4">
                  {createdCouncil.topic.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Title level={5} className="mb-0 text-gray-800">
                              {topic.title}
                            </Title>
                            <Tag color="green" className="font-medium">
                              #{topic.id}
                            </Tag>
                          </div>
                          <Paragraph className="text-gray-600 mb-0 text-sm leading-relaxed">
                            {topic.description}
                          </Paragraph>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOutlined className="text-4xl mb-2" />
                  <Text>Không có đề tài nào</Text>
                </div>
              )}
            </Card>

            {/* Council Members */}
            <Card 
              title={
                <div className="flex items-center">
                  <UserOutlined className="text-purple-500 mr-2" />
                  Thành Viên Hội Đồng ({createdCouncil.councilMembers.length})
                </div>
              }
              className="border-purple-200"
            >
              <div className="grid gap-4">
                {createdCouncil.councilMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <Text strong className="text-gray-800 text-base">
                              {member.fullName}
                            </Text>
                            <Tag 
                              color={councilService.getRoleColor(member.role)} 
                              className="font-medium px-3 py-1"
                            >
                              {councilService.getRoleDisplay(member.role)}
                            </Tag>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">📧</span>
                              <Text copyable={{ text: member.email }} className="text-gray-600">
                                {member.email}
                              </Text>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">📱</span>
                              {member.phoneNumber ? (
                                <Text copyable={{ text: member.phoneNumber }} className="text-gray-600">
                                  {member.phoneNumber}
                                </Text>
                              ) : (
                                <Text className="text-gray-400 italic">Chưa có SĐT</Text>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text className="text-xs text-gray-500">
                          ID: {member.accountId}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                size="large"
                onClick={() => setShowCouncilDetails(false)}
              >
                Đóng
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<EyeOutlined />}
                className="bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg"
                onClick={() => {
                  setShowCouncilDetails(false);
                  window.location.href = '/council/council-list';
                }}
              >
                Xem Danh Sách Hội Đồng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .council-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f0f9ff !important;
        }
        
        .custom-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background: #dbeafe !important;
        }
        
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: #10b981;
          border-color: #10b981;
        }
        
        .ant-steps-item-active .ant-steps-item-icon {
          background-color: #f59e0b;
          border-color: #f59e0b;
        }
      `}</style>
    </Layout>
  );
};

export default CouncilPage;