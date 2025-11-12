'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  message, 
  Pagination, 
  Tag, 
  Spin, 
  Empty,
  Tooltip,
  Result
} from 'antd';
import { 
  TeamOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Topic } from '../../../types/topic';
import { CouncilCreateRequest } from '../../../types/council';
import { topicService } from '../../../services/topicService';
import { councilService } from '../../../services/councilService';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const CouncilPage: React.FC = () => {
  const router = useRouter();
  const [allSortedTopics, setAllSortedTopics] = useState<Topic[]>([]); // Lưu toàn bộ danh sách đã sắp xếp
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>(''); // Lưu học kỳ hiện tại
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  // Tự động tính học kỳ dựa trên tháng hiện tại
  const getCurrentSemester = (): string => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() trả về 0-11, nên +1 để có 1-12
    const year = now.getFullYear();
    
    let semester: string;
    if (month >= 1 && month <= 4) {
      semester = 'SPRING';
    } else if (month >= 5 && month <= 8) {
      semester = 'SUMMER';
    } else {
      semester = 'FALL';
    }
    
    return `${semester}${year}`;
  };

  // Cập nhật học kỳ
  const updateSemester = () => {
    setCurrentSemester(getCurrentSemester());
  };

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('role');
      
      if (!token) {
        messageApi.error('Vui lòng đăng nhập');
        router.push('/auth/login');
        setIsChecking(false);
        return;
      }
      
      // Kiểm tra role (hỗ trợ cả HEADOFDEPARTMENT và HEAD_OF_DEPARTMENT)
      const normalizedRole = role?.toUpperCase().replace(/_/g, '');
      if (normalizedRole === 'HEADOFDEPARTMENT') {
        setIsAuthorized(true);
      } else {
        messageApi.error('Bạn không có quyền truy cập trang này');
        router.push('/');
      }
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized) return; // Chỉ chạy các logic khác nếu đã được authorize
    
    setIsMounted(true);
    updateSemester(); // Cập nhật học kỳ khi component mount
    fetchTopics();
    
    // Cập nhật học kỳ mỗi giờ để đảm bảo luôn đúng nếu thời gian thay đổi
    const interval = setInterval(() => {
      updateSemester();
    }, 60 * 60 * 1000); // Mỗi 1 giờ
    
    return () => clearInterval(interval); // Cleanup khi component unmount
  }, [currentPage, isAuthorized]);

  const formatDate = (dateString: string | null | undefined): string => {
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

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const allTopics = await topicService.getAllTopicsForReviewCouncil();
      
      // Sắp xếp theo reviewDate: ngày cũ hơn (nhỏ hơn) trước, ngày mới hơn (lớn hơn) sau
      const sortedTopics = [...allTopics].sort((a, b) => {
        const aReviewDate = (a as any).reviewDate;
        const bReviewDate = (b as any).reviewDate;
        
        // Nếu cả hai đều có reviewDate
        if (aReviewDate && bReviewDate) {
          const dateA = new Date(aReviewDate).getTime();
          const dateB = new Date(bReviewDate).getTime();
          return dateA - dateB; // Ngày cũ hơn (nhỏ hơn) trước
        }
        
        // Nếu chỉ a có reviewDate, a đứng trước
        if (aReviewDate && !bReviewDate) return -1;
        
        // Nếu chỉ b có reviewDate, b đứng trước
        if (!aReviewDate && bReviewDate) return 1;
        
        // Nếu cả hai đều không có reviewDate, giữ nguyên thứ tự
        return 0;
      });
      
      // Lưu toàn bộ danh sách đã sắp xếp
      setAllSortedTopics(sortedTopics);
      
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTopics = sortedTopics.slice(startIndex, endIndex);
      
      setTopics(paginatedTopics);
      setTotalPages(Math.ceil(sortedTopics.length / itemsPerPage));
      setTotalItems(sortedTopics.length);
    } catch (error) {
      console.error('Error fetching topics:', error);
      messageApi.error('Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (allSortedTopics.length === 0) {
      messageApi.error('Không có đề tài nào để tạo hội đồng');
      return;
    }

    setCreating(true);
    
    try {
      // Cập nhật học kỳ trước khi gửi để đảm bảo luôn đúng
      updateSemester();
      
      // Lấy toàn bộ ID của danh sách đã sắp xếp
      const allTopicIds = allSortedTopics.map(topic => topic.id);
      
      const request: CouncilCreateRequest = {
        semester: currentSemester || getCurrentSemester(),
        topicId: allTopicIds
      };

      await councilService.createCouncil(request);
      messageApi.success('Thành lập hội đồng thành công!');
      
      // Chuyển đến trang danh sách sau 1.5 giây
      setTimeout(() => {
        router.push('/head-of-department/council-list');
      }, 1500);
    } catch (error) {
      console.error('Error creating council:', error);
      messageApi.error('Có lỗi xảy ra khi thành lập hội đồng');
    } finally {
      setCreating(false);
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
      case 'PASSED_REVIEW_3': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PASSED_REVIEW_3': return 'PASSED_REVIEW_3';
      default: return status;
    }
  };

  // Kiểm tra quyền truy cập
  if (isChecking || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout className="min-h-screen">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Result
            status="403"
            title="Không có quyền truy cập"
            subTitle="Chỉ có Trưởng bộ môn mới được phép truy cập trang này."
            extra={
              <Button type="primary" onClick={() => router.push('/')}>
                Về trang chủ
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      {contextHolder}
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <Title level={2} className="text-orange-500 mb-2">
              <TeamOutlined /> Thành lập hội đồng
            </Title>
            <Paragraph className="text-base text-gray-600">
              Danh sách đề tài đã được sắp xếp theo ngày review. Bấm "Tạo hội đồng" để tạo hội đồng với tất cả đề tài.
            </Paragraph>
          </div>

          {/* Action Card */}
          <Card className="shadow-lg mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Title level={4} className="!mb-2">
                  <TeamOutlined className="text-orange-500 mr-2" />
                  Thông Tin Hội Đồng
                </Title>
                <div className="space-y-1">
                  <Text className="text-gray-600">
                    Học kỳ: <Text strong className="text-orange-600">{currentSemester || getCurrentSemester()}</Text>
                  </Text>
                  <br />
                  <Text className="text-gray-600">
                    Tổng số đề tài: <Text strong>{allSortedTopics.length}</Text>
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                loading={creating}
                disabled={allSortedTopics.length === 0}
                onClick={handleSubmit}
                style={{ 
                  backgroundColor: '#ff6b35',
                  borderColor: '#ff6b35',
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  paddingLeft: '32px',
                  paddingRight: '32px'
                }}
              >
                {creating ? 'Đang tạo...' : `Thành Lập Hội Đồng (${allSortedTopics.length} đề tài)`}
              </Button>
            </div>
          </Card>

          {/* Topics List */}
          <Row>
            <Col xs={24}>
              <Card 
                className="shadow-lg"
                title={
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <BookOutlined className="text-orange-500 text-xl" />
                      <Title level={4} className="!mb-0">
                        Danh Sách Đề Tài ({totalItems})
                      </Title>
                    </div>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={fetchTopics}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                  </div>
                }
              >
                <Spin spinning={loading} tip="Đang tải dữ liệu...">
                  {topics.length === 0 && !loading ? (
                    <Empty
                      description="Không có đề tài nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : topics.length > 0 ? (
                  <>
                    <div className="grid gap-4">
                      {topics.map((topic) => {
                        return (
                          <div
                            key={topic.id}
                            className="p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-md hover:shadow-lg"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <Title level={4} className="!mb-0 !text-gray-800 !font-bold !text-base">
                                    {topic.title}
                                  </Title>
                                  <Tag color={getStatusColor(topic.status || '')} className="flex-shrink-0 text-xs font-semibold px-2 py-1">
                                    {getStatusText(topic.status || '')}
                                  </Tag>
                                </div>
                                {topic.description && (
                                  <Tooltip title={topic.description}>
                                    <Paragraph 
                                      className="!mb-3 text-gray-600 text-sm leading-relaxed line-clamp-2"
                                      ellipsis={{ rows: 2 }}
                                    >
                                      {topic.description}
                                    </Paragraph>
                                  </Tooltip>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  {(topic as any).reviewDate && (
                                    <span className="flex items-center gap-1.5 bg-orange-100 px-2.5 py-1 rounded-md">
                                      <CalendarOutlined className="text-orange-600 text-sm" />
                                      <Text type="secondary" className="text-xs font-medium">Ngày review:</Text>
                                      <Text className="text-xs font-bold text-orange-700">
                                        {formatDate((topic as any).reviewDate)}
                                      </Text>
                                    </span>
                                  )}
                                  {topic.submitedAt && (
                                    <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md">
                                      <FileTextOutlined className="text-blue-600 text-sm" />
                                      <Text type="secondary" className="text-xs font-medium">Nộp:</Text>
                                      <Text className="text-xs font-bold text-blue-700">
                                        {formatDate(topic.submitedAt)}
                                      </Text>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center">
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
                  </>
                  ) : null}
                </Spin>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default CouncilPage;

