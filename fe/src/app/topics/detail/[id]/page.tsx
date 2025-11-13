'use client';
import { 
  Layout, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button,
  Descriptions,
  Spin,
  Empty,
  Divider,
  Result,
  Modal,
  Form,
  Input,
  message,
  Table,
  Select,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LinkOutlined,
  UserOutlined,
  EditOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  IdcardOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import React, { JSX, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/combination/Header';
import Footer from '../../../../components/combination/Footer';
import { useTopic } from '../../../../hooks/useTopic';
import { useAuth } from '../../../../hooks/useAuth';
import { Topic, STATUS_DISPLAY, STATUS_COLORS } from '../../../../types/topic';
import { topicService } from '../../../../services/topicService';
import { accountService, Account } from '../../../../services/accountService';
import { plagiarismService } from '../../../../services/plagiarismService';
import dayjs from 'dayjs';

const { Option } = Select;

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const SCHOOL_NAME = 'TRƯỜNG ĐẠI HỌC FPT';
const FORM_TITLE = 'ĐĂNG KÝ ĐỀ TÀI';

function TopicDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const topicId = params?.id as string;
  
  const { currentTopic, loading, fetchTopicById } = useTopic();
  const { isAuthenticated, isLoading: authLoading, requireAuth, getToken, userInfo } = useAuth();
  const [error, setError] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  
  // Member management states
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState<number | undefined>(undefined);

  // Check authentication first
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      requireAuth('/auth/login');
    }
  }, [authLoading, isAuthenticated]);

  // Load topic data after authentication check
  useEffect(() => {
    if (!authLoading && isAuthenticated && topicId) {
      loadTopicDetail();
      checkEditPermission();
      loadTopicMembers();
    }
  }, [topicId, authLoading, isAuthenticated]);

  const loadTopicDetail = async () => {
    try {
      setError(false);
      await fetchTopicById(Number(topicId));
    } catch (err) {
      console.error('Error loading topic detail:', err);
      setError(true);
    }
  };

  const checkEditPermission = async () => {
    try {
      const permission = await topicService.canUserEditTopic(Number(topicId));
      setCanEdit(permission);
    } catch (err) {
      console.error('Error checking edit permission:', err);
      setCanEdit(false);
    }
  };

  const handleBack = () => {
    router.push('/topics/list');
  };

  const loadTopicMembers = async () => {
    if (!topicId) return;
    setLoadingMembers(true);
    try {
      const membersList = await topicService.getTopicMembers(Number(topicId));
      setMembers(membersList || []);
    } catch (error) {
      console.error('Error loading topic members:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadAvailableAccounts = async (currentMembers?: any[]) => {
    setLoadingAccounts(true);
    try {
      const accounts = await accountService.getAllAccounts();
      // Filter out accounts that are already members
      const membersToUse = currentMembers || members;
      const existingMemberIds = membersToUse.map(m => m.accountId);
      const filteredAccounts = accounts.filter(acc => !existingMemberIds.includes(acc.id));
      setAvailableAccounts(filteredAccounts);
    } catch (error) {
      console.error('Error loading available accounts:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberToAdd || !topicId) {
      message.warning('Vui lòng chọn người dùng để thêm');
      return;
    }

    try {
      await topicService.addTopicMember(Number(topicId), memberToAdd);
      message.success('Thêm thành viên thành công');
      setMemberToAdd(undefined);
      // Reload members first, then reload available accounts with updated members
      const updatedMembers = await topicService.getTopicMembers(Number(topicId));
      setMembers(updatedMembers || []);
      await loadAvailableAccounts(updatedMembers || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể thêm thành viên');
    }
  };

  const handleRemoveMember = async (accountId: number, accountName: string) => {
    if (!topicId) return;

    Modal.confirm({
      title: 'Xác nhận xóa thành viên',
      content: `Bạn có chắc chắn muốn xóa thành viên "${accountName}" khỏi đề tài?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await topicService.removeTopicMember(Number(topicId), accountId);
          message.success('Xóa thành viên thành công');
          // Reload members first, then reload available accounts with updated members
          const updatedMembers = await topicService.getTopicMembers(Number(topicId));
          setMembers(updatedMembers || []);
          await loadAvailableAccounts(updatedMembers || []);
        } catch (error: any) {
          message.error(error.message || 'Không thể xóa thành viên');
        }
      },
    });
  };

  const handleEditClick = async () => {
    if (currentTopic) {
      form.setFieldsValue({
        title: currentTopic.title,
        description: getDescriptionWithoutKeywords(currentTopic.description),
      });
      setIsEditModalVisible(true);
      await loadTopicMembers();
      await loadAvailableAccounts();
    }
  };

  const handleEditSubmit = async () => {
    const updateLoadingMsg = message.loading('Đang cập nhật đề tài...', 0);
    
    try {
      const values = await form.validateFields();
      
      if (!currentTopic) {
        updateLoadingMsg();
        return;
      }
      
      // Kiểm tra quyền edit trước khi submit
      const canEditCheck = await topicService.canUserEditTopic(currentTopic.id);
      if (!canEditCheck) {
        updateLoadingMsg();
        message.error('Bạn không có quyền chỉnh sửa đề tài này!');
        setIsEditModalVisible(false);
        return;
      }
      
      const token = getToken();
      const API_BASE = process.env.TOPIC_API_BASE_URL || 'http://localhost:8080';

      // Bước 1: Xóa dữ liệu cũ trong Qdrant
      try {
        const deleteLoadingMsg = message.loading('Đang xóa dữ liệu cũ trong Qdrant...', 0);
        await plagiarismService.deleteTopicFromQdrant(currentTopic.id);
        deleteLoadingMsg();
        console.log('Successfully deleted topic from Qdrant');
      } catch (deleteError: any) {
        updateLoadingMsg();
        console.error('Error deleting topic from Qdrant:', deleteError);
        throw new Error(`Không thể xóa dữ liệu cũ trong Qdrant: ${deleteError.message || 'Lỗi không xác định'}`);
      }

      // Bước 2: Update topic (backend sẽ tự động xóa file cũ trên S3)
      const response = await fetch(
        `${API_BASE}/topic-approval-service/api/topics/update/${currentTopic.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            title: values.title,
            description: values.description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.code !== 200) {
        updateLoadingMsg();
        throw new Error(data.message || 'Cập nhật thất bại');
      }

      updateLoadingMsg();
      message.success('Cập nhật đề tài thành công!');
      
      // Bước 3: Generate file mới và gửi đến plagiarism check (đẩy dữ liệu mới vào Qdrant)
      try {
        const fileGenLoadingMsg = message.loading('Đang tạo file mới và kiểm tra đạo văn...', 0);
        
        // Lấy thông tin chủ nhiệm từ user đang đăng nhập hoặc từ topic
        const piFullName = userInfo?.name || 'N/A';
        const piLecturerId = userInfo?.lecturerId || userInfo?.employeeId || userInfo?.id?.toString() || 'N/A';
        
        // Format date
        const d = dayjs();
        const docDateStr = `Ngày ${d.date()} tháng ${d.month() + 1} năm ${d.year()}`;
        
        // Convert members to format expected by generate-topic-file API
        const membersForFile = members
          .filter(m => m.role === 'MEMBER') // Chỉ lấy members, không lấy CREATOR
          .map(m => ({
            accountId: m.accountId,
            fullName: m.accountName || '',
            email: '', // Có thể cần lấy từ account service
            note: '',
          }));

        // Generate file DOCX
        const fileResponse = await fetch('/api/generate-topic-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docDateStr,
            university: SCHOOL_NAME,
            formTitle: FORM_TITLE,
            topicTitle: values.title,
            piFullName,
            piLecturerId,
            description: values.description,
            members: membersForFile,
            format: 'docx',
          }),
        });

        if (fileResponse.ok) {
          const blob = await fileResponse.blob();
          
          if (blob.size === 0) {
            throw new Error('Generated file is empty');
          }

          const file = new File([blob], `de_tai_${currentTopic.id}.docx`, {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          // Gửi file đến plagiarism check (API này sẽ upload lên S3 và gọi N8N)
          await plagiarismService.checkPlagiarism(file, currentTopic.id);
          
          fileGenLoadingMsg();
          message.success('Đã tạo file mới và gửi kiểm tra đạo văn thành công!');
        } else {
          const errorText = await fileResponse.text();
          console.error('Failed to generate file:', fileResponse.status, errorText);
          fileGenLoadingMsg();
          message.warning('Cập nhật đề tài thành công nhưng không thể tạo file mới. Vui lòng thử lại sau.');
        }
      } catch (fileError: any) {
        console.error('Error generating file or checking plagiarism:', fileError);
        message.warning('Cập nhật đề tài thành công nhưng không thể tạo file mới. Vui lòng thử lại sau.');
      }

      setIsEditModalVisible(false);
      form.resetFields();
      
      // Reload topic detail and members
      await loadTopicDetail();
      await loadTopicMembers();
    } catch (error: any) {
      updateLoadingMsg();
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật đề tài');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
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

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  };

  const getStatusText = (status: string) => {
    return STATUS_DISPLAY[status as keyof typeof STATUS_DISPLAY] || status;
  };

  // Extract keywords from description
  const extractKeywords = (description: string): string[] => {
    const match = description.match(/Từ khóa:\s*(.+)$/);
    if (match) {
      return match[1].split(',').map(k => k.trim());
    }
    return [];
  };

  const getDescriptionWithoutKeywords = (description: string): string => {
    return description.replace(/\n\nTừ khóa:.*$/, '');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-10 bg-gray-50 flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <Spin size="large" tip="Đang kiểm tra xác thực..." />
        </Content>
        <Footer />
      </Layout>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-10 bg-gray-50">
          <Result
            status="403"
            title="Yêu cầu đăng nhập"
            subTitle="Bạn cần đăng nhập để xem chi tiết đề tài."
            extra={
              <Button type="primary" onClick={() => router.push('/auth/login')}>
                Đăng nhập ngay
              </Button>
            }
          />
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-10 bg-gray-50 flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <Spin size="large" tip="Đang tải thông tin đề tài..." />
        </Content>
        <Footer />
      </Layout>
    );
  }

  if (error || !currentTopic) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="p-10 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Result
              status="404"
              title="Không tìm thấy đề tài"
              subTitle="Đề tài này không tồn tại hoặc đã bị xóa."
              extra={
                <Button type="primary" onClick={handleBack}>
                  Quay lại danh sách
                </Button>
              }
            />
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  const keywords = extractKeywords(currentTopic.description);
  const descriptionText = getDescriptionWithoutKeywords(currentTopic.description);

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            size="large"
            className="mb-6"
          >
            Quay lại danh sách
          </Button>

          <Card className="shadow-lg">
            {/* Header */}
            <div className="mb-6">
              <Space className="mb-4">
                <Tag color="blue">ID: {currentTopic.id}</Tag>
                <Tag color={getStatusColor(currentTopic.status)}>
                  {getStatusText(currentTopic.status)}
                </Tag>
              </Space>
              
              <Title level={2} className="mb-2">
                <FileTextOutlined className="mr-2" />
                {currentTopic.title}
              </Title>
            </div>

            <Divider />

            {/* Basic Info */}
            <Descriptions title="Thông tin cơ bản" bordered column={1} size="middle">
              <Descriptions.Item label="Tên đề tài">
                <Text strong>{currentTopic.title}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Mô tả">
                <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                  {descriptionText}
                </Paragraph>
              </Descriptions.Item>

              {keywords.length > 0 && (
                <Descriptions.Item label="Từ khóa">
                  <Space wrap>
                    {keywords.map((keyword, idx) => (
                      <Tag key={idx} color="cyan">
                        {keyword}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(currentTopic.status)} className="text-base px-3 py-1">
                  {getStatusText(currentTopic.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày nộp</span>
                  </Space>
                }
              >
                <Text>{formatDate(currentTopic.submitedAt)}</Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày tạo</span>
                  </Space>
                }
              >
                <Text type="secondary">{formatDate(currentTopic.createdAt)}</Text>
              </Descriptions.Item>

              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Ngày cập nhật</span>
                  </Space>
                }
              >
                <Text type="secondary">{formatDate(currentTopic.updatedAt)}</Text>
              </Descriptions.Item>

              {currentTopic.filePathUrl && (
                <Descriptions.Item 
                  label={
                    <Space>
                      <LinkOutlined />
                      <span>File đính kèm</span>
                    </Space>
                  }
                >
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      if (currentTopic.filePathUrl) {
                        window.open(currentTopic.filePathUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    size="middle"
                  >
                    Tải xuống file
                  </Button>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* Members Section */}
            <div className="mb-6">
              <Title level={4} className="mb-4">
                <TeamOutlined className="mr-2" />
                Danh sách thành viên
              </Title>
              <Spin spinning={loadingMembers}>
                {members.length > 0 ? (
                  <Table
                    dataSource={members}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    columns={[
                      {
                        title: 'STT',
                        key: 'index',
                        width: 60,
                        align: 'center',
                        render: (_: any, __: any, index: number) => index + 1,
                      },
                      {
                        title: 'Họ và tên',
                        dataIndex: 'accountName',
                        key: 'accountName',
                        render: (text: string) => <Text strong>{text}</Text>,
                      },
                      {
                        title: 'Vai trò',
                        dataIndex: 'role',
                        key: 'role',
                        align: 'center',
                        render: (role: string) => {
                          const roleMap: { [key: string]: { text: string; color: string } } = {
                            'CREATOR': { text: 'Chủ nhiệm', color: 'red' },
                            'MEMBER': { text: 'Thành viên', color: 'blue' },
                          };
                          const roleInfo = roleMap[role] || { text: role, color: 'default' };
                          return <Tag color={roleInfo.color} style={{ fontSize: '14px', padding: '4px 12px' }}>{roleInfo.text}</Tag>;
                        },
                      },
                    ]}
                    bordered
                  />
                ) : (
                  <Empty
                    description="Chưa có thành viên nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '40px 0' }}
                  />
                )}
              </Spin>
            </div>

            <Divider />

            {/* Actions */}
            <Space className="w-full justify-end">
              {canEdit && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEditClick}
                  size="large"
                >
                  Chỉnh sửa
                </Button>
              )}
              <Button onClick={handleBack} size="large">
                Đóng
              </Button>
            </Space>
          </Card>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="text-center">
              <FileTextOutlined className="text-4xl text-orange-500 mb-2" />
              <Text type="secondary" className="block">Mã đề tài</Text>
              <Title level={4} className="mb-0">#{currentTopic.id}</Title>
            </Card>

            <Card className="text-center">
              <CalendarOutlined className="text-4xl text-blue-500 mb-2" />
              <Text type="secondary" className="block">Ngày nộp</Text>
              <Title level={4} className="mb-0">
                {currentTopic.submitedAt 
                  ? new Date(currentTopic.submitedAt).toLocaleDateString('vi-VN')
                  : 'Chưa nộp'
                }
              </Title>
            </Card>

            <Card className="text-center">
              <Tag 
                color={getStatusColor(currentTopic.status)} 
                className="text-2xl px-4 py-2 mb-2"
                style={{ fontSize: '24px' }}
              >
                {getStatusText(currentTopic.status)}
              </Tag>
              <Text type="secondary" className="block mt-2">Trạng thái hiện tại</Text>
            </Card>
          </div>
        </div>
      </Content>

      {/* Edit Modal */}
      <Modal
        title={<Space><EditOutlined /> Chỉnh sửa đề tài</Space>}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
          setMemberToAdd(undefined);
        }}
        onOk={handleEditSubmit}
        okText="Cập nhật"
        cancelText="Hủy"
        width={900}
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

          <Divider orientation="left">
            <Space>
              <TeamOutlined style={{ color: '#1890ff' }} />
              <Text strong>Quản lý thành viên</Text>
            </Space>
          </Divider>

          {/* Members Table */}
          <div style={{ marginBottom: 16 }}>
            <Spin spinning={loadingMembers}>
              <Table
                dataSource={members}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'STT',
                    key: 'index',
                    width: 60,
                    render: (_: any, __: any, index: number) => index + 1,
                  },
                  {
                    title: 'Họ và tên',
                    dataIndex: 'accountName',
                    key: 'accountName',
                  },
                  {
                    title: 'Vai trò',
                    dataIndex: 'role',
                    key: 'role',
                    render: (role: string) => {
                      const roleMap: { [key: string]: { text: string; color: string } } = {
                        'CREATOR': { text: 'Chủ nhiệm', color: 'red' },
                        'MEMBER': { text: 'Thành viên', color: 'blue' },
                      };
                      const roleInfo = roleMap[role] || { text: role, color: 'default' };
                      return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
                    },
                  },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    width: 100,
                    render: (_: any, record: any) => {
                      // Không cho xóa chủ nhiệm (CREATOR)
                      if (record.role === 'CREATOR') {
                        return <Text type="secondary">-</Text>;
                      }
                      return (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveMember(record.accountId, record.accountName)}
                        >
                          Xóa
                        </Button>
                      );
                    },
                  },
                ]}
                locale={{
                  emptyText: <Empty description="Chưa có thành viên" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                }}
              />
            </Spin>
          </div>

          {/* Add Member Section */}
          <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text strong>
                <PlusOutlined /> Thêm thành viên mới
              </Text>
              <Row gutter={12} align="middle">
                <Col flex="auto">
                  <Select
                    showSearch
                    value={memberToAdd}
                    onChange={setMemberToAdd}
                    placeholder="Chọn người dùng để thêm vào đề tài"
                    style={{ width: '100%' }}
                    loading={loadingAccounts}
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const children = option?.children as any;
                      if (typeof children === 'string') {
                        return children.toLowerCase().includes(input.toLowerCase());
                      }
                      return false;
                    }}
                  >
                    {availableAccounts.map((account) => (
                      <Option key={account.id} value={account.id}>
                        <Space>
                          <UserOutlined />
                          <Text>{account.name}</Text>
                          <Text type="secondary">({account.email})</Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddMember}
                    disabled={!memberToAdd}
                  >
                    Thêm
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        </Form>
      </Modal>

      <Footer />
    </Layout>
  );
}

export default TopicDetailPage;
