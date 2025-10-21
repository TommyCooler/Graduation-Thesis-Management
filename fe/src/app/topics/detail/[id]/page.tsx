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
  Result
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LinkOutlined,
  UserOutlined
} from '@ant-design/icons';
import React, { JSX, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/combination/Header';
import Footer from '../../../../components/combination/Footer';
import { useTopic } from '../../../../hooks/useTopic';
import { useAuth } from '../../../../hooks/useAuth';
import { Topic, STATUS_DISPLAY, STATUS_COLORS } from '../../../../types/topic';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function TopicDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const topicId = params?.id as string;
  
  const { currentTopic, loading, fetchTopicById } = useTopic();
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth();
  const [error, setError] = useState<boolean>(false);

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

  const handleBack = () => {
    router.push('/topics/list');
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
                  <a 
                    href={currentTopic.filePathUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {currentTopic.filePathUrl}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* Actions */}
            <Space className="w-full justify-end">
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

      <Footer />
    </Layout>
  );
}

export default TopicDetailPage;
