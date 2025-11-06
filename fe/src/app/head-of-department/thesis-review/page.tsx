'use client';
import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Typography,
  Modal,
  Form,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  Badge,
  Descriptions,
  Tooltip,
  Spin,
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
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';
import { topicService } from '../../../services/topicService';
import { TopicWithApprovalStatus, TOPIC_STATUS, STATUS_DISPLAY, STATUS_COLORS } from '../../../types/topic';
import PlagiarismResultsModal from '../../../components/PlagiarismResultsModal';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ThesisReviewPage() {
  const [pendingTopics, setPendingTopics] = useState<TopicWithApprovalStatus[]>([]);
  const [approvedTopics, setApprovedTopics] = useState<TopicWithApprovalStatus[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicWithApprovalStatus | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPlagiarismModalVisible, setIsPlagiarismModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        topicService.getPendingTopicsForApproval(),
        topicService.getApprovedTopicsByUser(),
      ]);
      setPendingTopics(pending);
      setApprovedTopics(approved);
    } catch (error) {
      console.error('Error loading topics:', error);
      message.error('Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (topic: TopicWithApprovalStatus) => {
    setSelectedTopic(topic);
    setIsModalVisible(true);
  };

  const handleApprove = async (values: { comment?: string }) => {
    if (!selectedTopic) return;

    try {
      setLoading(true);
      const result = await topicService.approveTopicV2(selectedTopic.id, {
        comment: values.comment,
      });

      message.success(`Đã phê duyệt đề tài! Trạng thái: ${result.approvalStatus}`);
      setIsModalVisible(false);
      form.resetFields();
      await loadTopics(); // Reload data
    } catch (error: any) {
      console.error('Error approving topic:', error);
      message.error(error.message || 'Không thể phê duyệt đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values: { reason: string }) => {
    if (!selectedTopic) return;

    try {
      setLoading(true);
      await topicService.rejectTopic(selectedTopic.id, values.reason);
      message.success('Đã từ chối đề tài');
      setIsModalVisible(false);
      form.resetFields();
      await loadTopics();
    } catch (error: any) {
      console.error('Error rejecting topic:', error);
      message.error(error.message || 'Không thể từ chối đề tài');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTopics = (topics: TopicWithApprovalStatus[]) => {
    if (!searchText) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(searchText.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái duyệt',
      key: 'approvalStatus',
      width: '15%',
      render: (_: any, record: TopicWithApprovalStatus) => (
        <Space direction="vertical" size="small">
          <Badge
            count={record.approvalStatus}
            style={{
              backgroundColor:
                record.approvalCount === 0
                  ? '#d9d9d9'
                  : record.approvalCount === 1
                  ? '#faad14'
                  : '#52c41a',
            }}
          />
          <Tag color={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]}>
            {STATUS_DISPLAY[record.status as keyof typeof STATUS_DISPLAY]}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submitedAt',
      key: 'submitedAt',
      width: '12%',
      render: (date: string) => topicService.formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '8%',
      fixed: 'right' as const,
      render: (_: any, record: TopicWithApprovalStatus) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <Badge count={getFilteredTopics(pendingTopics).length} offset={[10, 0]}>
          <Space>
            <ClockCircleOutlined />
            Chờ duyệt
          </Space>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={getFilteredTopics(pendingTopics)}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đề tài`,
          }}
        />
      ),
    },
    {
      key: 'approved',
      label: (
        <Badge count={getFilteredTopics(approvedTopics).length} offset={[10, 0]}>
          <Space>
            <CheckCircleOutlined />
            Đã duyệt bởi tôi
          </Space>
        </Badge>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={getFilteredTopics(approvedTopics)}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đề tài`,
          }}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px 48px', marginTop: 64 }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <FileTextOutlined /> Duyệt đề tài
                </Title>
                <Text type="secondary">
                  Hệ thống duyệt 2 cấp - Cần 2 người duyệt để đề tài được công bố
                </Text>
              </Col>
            </Row>

            {/* Statistics */}
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Chờ duyệt"
                    value={pendingTopics.length}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Đã duyệt bởi tôi"
                    value={approvedTopics.length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng cần xử lý"
                    value={pendingTopics.length + approvedTopics.length}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Search */}
            <Input
              placeholder="Tìm kiếm đề tài..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 400 }}
            />

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Space>
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <FileTextOutlined />
              <span>Chi tiết đề tài</span>
              {selectedTopic && (
                <Badge
                  count={selectedTopic.approvalStatus}
                  style={{
                    backgroundColor:
                      selectedTopic.approvalCount === 0
                        ? '#d9d9d9'
                        : selectedTopic.approvalCount === 1
                        ? '#faad14'
                        : '#52c41a',
                  }}
                />
              )}
            </Space>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          width={800}
          footer={null}
        >
          {selectedTopic && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Tiêu đề" span={2}>
                  {selectedTopic.title}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedTopic.description}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={STATUS_COLORS[selectedTopic.status as keyof typeof STATUS_COLORS]}>
                    {STATUS_DISPLAY[selectedTopic.status as keyof typeof STATUS_DISPLAY]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái duyệt">
                  <Badge
                    count={selectedTopic.approvalStatus}
                    style={{
                      backgroundColor:
                        selectedTopic.approvalCount === 0
                          ? '#d9d9d9'
                          : selectedTopic.approvalCount === 1
                          ? '#faad14'
                          : '#52c41a',
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nộp">
                  {topicService.formatDateTime(selectedTopic.submitedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {topicService.formatDateTime(selectedTopic.createdAt)}
                </Descriptions.Item>
                {selectedTopic.filePathUrl && (
                  <Descriptions.Item label="File đính kèm" span={2}>
                    <Space>
                      <a href={selectedTopic.filePathUrl} target="_blank" rel="noopener noreferrer">
                        <Button icon={<FileTextOutlined />}>Xem file</Button>
                      </a>
                      <Button
                        icon={<WarningOutlined />}
                        onClick={() => setIsPlagiarismModalVisible(true)}
                        danger
                      >
                        Xem danh sách đạo văn
                      </Button>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Approval History */}
              {selectedTopic.approvals.length > 0 && (
                <Card title={<Space><TeamOutlined /> Lịch sử duyệt</Space>} size="small">
                  {selectedTopic.approvals.map((approval, idx) => (
                    <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <UserOutlined />
                          <Text strong>{approval.approverName}</Text>
                          <Text type="secondary">({approval.approverEmail})</Text>
                        </Space>
                        <Text type="secondary">
                          {new Date(approval.approvedAt).toLocaleString('vi-VN')}
                        </Text>
                        {approval.comment && (
                          <Text>Nhận xét: {approval.comment}</Text>
                        )}
                      </Space>
                    </Card>
                  ))}
                </Card>
              )}

              {/* Action Form - Only show for pending topics */}
              {!selectedTopic.hasUserApproved && (
                <Form form={form} onFinish={handleApprove} layout="vertical">
                  <Form.Item
                    name="comment"
                    label="Nhận xét (tùy chọn)"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập nhận xét về đề tài..."
                    />
                  </Form.Item>

                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<CheckOutlined />}
                      loading={loading}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Từ chối đề tài',
                          content: (
                            <Form onFinish={handleReject}>
                              <Form.Item
                                name="reason"
                                label="Lý do từ chối"
                                rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                              >
                                <TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                              </Form.Item>
                            </Form>
                          ),
                          okText: 'Từ chối',
                          cancelText: 'Hủy',
                          okButtonProps: { danger: true },
                        });
                      }}
                    >
                      Từ chối
                    </Button>
                  </Space>
                </Form>
              )}

              {selectedTopic.hasUserApproved && (
                <Card>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                    <Text strong>Bạn đã phê duyệt đề tài này</Text>
                  </Space>
                </Card>
              )}
            </Space>
          )}
        </Modal>

        {/* Plagiarism Results Modal */}
        <PlagiarismResultsModal
          visible={isPlagiarismModalVisible}
          topicId={selectedTopic?.id || null}
          onClose={() => setIsPlagiarismModalVisible(false)}
        />
      </Content>
      <Footer />
    </Layout>
  );
}
