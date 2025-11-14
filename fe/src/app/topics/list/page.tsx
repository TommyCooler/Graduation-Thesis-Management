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
  Row,
  Col,
  Spin,
  Empty,
  Tooltip,
  Badge,
  Select,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  UserOutlined
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
import { accountService, Account } from '../../../services/accountService';
import { plagiarismService } from '../../../services/plagiarismService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const SCHOOL_NAME = 'TRƯỜNG ĐẠI HỌC FPT';
const FORM_TITLE = 'ĐĂNG KÝ ĐỀ TÀI';

export default function TopicsList(): JSX.Element {
  const router = useRouter();
  const { isAuthenticated, getToken, isLoading: authLoading, userInfo } = useAuth();
  
  const [topics, setTopics] = useState<TopicWithApprovalStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingTopic, setEditingTopic] = useState<TopicWithApprovalStatus | null>(null);
  const [form] = Form.useForm();
  const [editPermissions, setEditPermissions] = useState<Record<number, boolean>>({});
  
  // Member management states
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState<number | undefined>(undefined);

  // Load topics on mount and when auth status changes
  useEffect(() => {
    // Đợi auth check xong rồi mới load topics
    if (!authLoading) {
      console.log('Auth check completed, isAuthenticated:', isAuthenticated);
      loadApprovedTopics();
    }
  }, [authLoading, isAuthenticated]);

  // Load permissions when auth status changes or topics change
  useEffect(() => {
    if (isAuthenticated && topics.length > 0) {
      loadEditPermissions();
    }
  }, [isAuthenticated, topics.length]);

  const loadEditPermissions = async () => {
    if (!isAuthenticated || topics.length === 0) return;
    
    try {
      const permissions: Record<number, boolean> = {};
      await Promise.all(
        topics.map(async (topic) => {
          const canEdit = await topicService.canUserEditTopic(topic.id);
          permissions[topic.id] = canEdit;
        })
      );
      setEditPermissions(permissions);
    } catch (error) {
      console.error('Error loading edit permissions:', error);
    }
  };

  const loadApprovedTopics = async () => {
    try {
      setLoading(true);
      console.log('loadApprovedTopics called, isAuthenticated:', isAuthenticated);
      
      // Lấy danh sách topics của người dùng đăng nhập
      if (isAuthenticated) {
        console.log('Loading my topics...');
        const myTopics = await topicService.getMyTopics();
        console.log('My topics loaded:', myTopics);
        setTopics(myTopics as TopicWithApprovalStatus[]);
        
        // Kiểm tra quyền edit cho từng topic
        if (myTopics.length > 0) {
          const permissions: Record<number, boolean> = {};
          await Promise.all(
            myTopics.map(async (topic) => {
              const canEdit = await topicService.canUserEditTopic(topic.id);
              permissions[topic.id] = canEdit;
            })
          );
          setEditPermissions(permissions);
        } else {
          console.warn('No topics found for current user');
        }
      } else {
        // Nếu chưa đăng nhập, lấy danh sách topics đã được fully approved
        console.log('Loading fully approved topics...');
        const fullyApproved = await topicService.getFullyApprovedTopics();
        console.log('Fully approved topics loaded:', fullyApproved);
        setTopics(fullyApproved);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
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

  const loadTopicMembers = async (topicId: number) => {
    setLoadingMembers(true);
    try {
      const membersList = await topicService.getTopicMembers(topicId);
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
    if (!memberToAdd || !editingTopic) {
      message.warning('Vui lòng chọn người dùng để thêm');
      return;
    }

    try {
      await topicService.addTopicMember(editingTopic.id, memberToAdd);
      message.success('Thêm thành viên thành công');
      setMemberToAdd(undefined);
      // Reload members first, then reload available accounts with updated members
      const updatedMembers = await topicService.getTopicMembers(editingTopic.id);
      setMembers(updatedMembers || []);
      await loadAvailableAccounts(updatedMembers || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể thêm thành viên');
    }
  };

  const handleRemoveMember = async (accountId: number, accountName: string) => {
    if (!editingTopic) return;

    Modal.confirm({
      title: 'Xác nhận xóa thành viên',
      content: `Bạn có chắc chắn muốn xóa thành viên "${accountName}" khỏi đề tài?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await topicService.removeTopicMember(editingTopic.id, accountId);
          message.success('Xóa thành viên thành công');
          // Reload members first, then reload available accounts with updated members
          const updatedMembers = await topicService.getTopicMembers(editingTopic.id);
          setMembers(updatedMembers || []);
          await loadAvailableAccounts(updatedMembers || []);
        } catch (error: any) {
          message.error(error.message || 'Không thể xóa thành viên');
        }
      },
    });
  };

  const handleEditTopic = async (topic: TopicWithApprovalStatus) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      title: topic.title,
      description: topic.description,
    });
    setIsEditModalVisible(true);
    // Load members and available accounts when opening edit modal
    await loadTopicMembers(topic.id);
    await loadAvailableAccounts();
  };

  const handleEditSubmit = async () => {
    const updateLoadingMsg = message.loading('Đang cập nhật đề tài...', 0);
    
    try {
      const values = await form.validateFields();
      
      if (!editingTopic) {
        updateLoadingMsg();
        return;
      }
      
      // Kiểm tra quyền edit trước khi submit
      const canEdit = await topicService.canUserEditTopic(editingTopic.id);
      if (!canEdit) {
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
        await plagiarismService.deleteTopicFromQdrant(editingTopic.id);
        deleteLoadingMsg();
        console.log('Successfully deleted topic from Qdrant');
      } catch (deleteError: any) {
        updateLoadingMsg();
        console.error('Error deleting topic from Qdrant:', deleteError);
        throw new Error(`Không thể xóa dữ liệu cũ trong Qdrant: ${deleteError.message || 'Lỗi không xác định'}`);
      }

      // Bước 2: Update topic (backend sẽ tự động xóa file cũ trên S3)
      const response = await fetch(
        `${API_BASE}/topic-approval-service/api/topics/update/${editingTopic.id}`,
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

          const file = new File([blob], `de_tai_${editingTopic.id}.docx`, {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          // Gửi file đến plagiarism check (API này sẽ upload lên S3 và gọi N8N)
          await plagiarismService.checkPlagiarism(file, editingTopic.id);
          
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
      setMemberToAdd(undefined);
      loadApprovedTopics(); // Reload danh sách
    } catch (error: any) {
      updateLoadingMsg();
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật đề tài');
    }
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
        <Space>
          <CalendarOutlined />
          <Text type="secondary">{formatDate(date)}</Text>
        </Space>
      ),
      sorter: (a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Descend: mới nhất lên đầu
      },
      defaultSortOrder: 'descend' as const, // Mặc định sắp xếp mới nhất ở đầu
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
          {isAuthenticated && editPermissions[record.id] && (
            <Tooltip title="Chỉnh sửa đề tài (chỉ người tạo và người tham gia)">
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
        {authLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Spin size="large" tip="Đang kiểm tra xác thực..." />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Title level={2} className="text-orange-500 mb-2">
                <FileTextOutlined /> Danh sách đề tài
              </Title>
              <Paragraph className="text-base text-gray-600">
                {isAuthenticated 
                  ? 'Xem và quản lý các đề tài bạn đã đăng tải'
                  : 'Xem và tìm kiếm các đề tài đã được đăng tải'}
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
                  description={isAuthenticated 
                    ? "Bạn chưa có đề tài nào"
                    : "Chưa có đề tài nào được duyệt"}
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
        )}
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
