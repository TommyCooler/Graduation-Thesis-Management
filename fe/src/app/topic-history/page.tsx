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
  Select,
  Typography,
  Modal,
  Row,
  Col,
  Statistic,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Timeline,
  Descriptions,
  Alert,
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import { TopicHistory, TopicHistoryFilters } from '../../types/topic-history';
import topicHistoryService from '../../services/topicHistoryService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock data cho lịch sử thay đổi đề tài
const mockTopicHistory: TopicHistory[] = [
  {
    id: 1,
    topicId: 1,
    topicName: 'Hệ thống quản lý thư viện số sử dụng AI và Machine Learning',
    changedContent: 'Cập nhật mục tiêu nghiên cứu: Thêm mục tiêu về tối ưu hóa hiệu suất hệ thống và cải thiện trải nghiệm người dùng',
    updatedBy: 'Nguyễn Văn A',
    updatedAt: '2024-01-25T14:30:00',
    actionType: 'UPDATE',
  },
  {
    id: 2,
    topicId: 1,
    topicName: 'Hệ thống quản lý thư viện số sử dụng AI và Machine Learning',
    changedContent: 'Cập nhật phương pháp nghiên cứu: Sử dụng thêm thuật toán Deep Learning và Natural Language Processing',
    updatedBy: 'ThS. Trần Thị B',
    updatedAt: '2024-01-24T09:15:00',
    actionType: 'UPDATE',
  },
  {
    id: 3,
    topicId: 1,
    topicName: 'Hệ thống quản lý thư viện số sử dụng AI và Machine Learning',
    changedContent: 'Tạo đề tài mới với chủ đề về ứng dụng AI trong quản lý thư viện',
    updatedBy: 'Nguyễn Văn A',
    updatedAt: '2024-01-20T10:00:00',
    actionType: 'CREATE',
  },
  {
    id: 4,
    topicId: 2,
    topicName: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản',
    changedContent: 'Cập nhật tóm tắt đề tài: Bổ sung thông tin về tính bảo mật và minh bạch của hệ thống blockchain',
    updatedBy: 'Lê Văn C',
    updatedAt: '2024-01-23T16:45:00',
    actionType: 'UPDATE',
  },
  {
    id: 5,
    topicId: 2,
    topicName: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản',
    changedContent: 'Cập nhật kết quả mong đợi: Điều chỉnh mục tiêu về thời gian phản hồi từ 5 giây xuống 3 giây',
    updatedBy: 'TS. Phạm Thị D',
    updatedAt: '2024-01-22T11:20:00',
    actionType: 'UPDATE',
  },
  {
    id: 6,
    topicId: 2,
    topicName: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng nông sản',
    changedContent: 'Tạo đề tài mới về ứng dụng blockchain trong nông nghiệp',
    updatedBy: 'Lê Văn C',
    updatedAt: '2024-01-19T08:30:00',
    actionType: 'CREATE',
  },
  {
    id: 7,
    topicId: 3,
    topicName: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
    changedContent: 'Cập nhật mục tiêu: Thêm mục tiêu về giảm thiểu tác động môi trường và tiết kiệm năng lượng',
    updatedBy: 'Hoàng Thị E',
    updatedAt: '2024-01-21T13:10:00',
    actionType: 'UPDATE',
  },
  {
    id: 8,
    topicId: 3,
    topicName: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
    changedContent: 'Cập nhật phương pháp: Sử dụng thêm Machine Learning và Computer Vision cho phân tích dữ liệu',
    updatedBy: 'ThS. Nguyễn Văn F',
    updatedAt: '2024-01-20T15:25:00',
    actionType: 'UPDATE',
  },
  {
    id: 9,
    topicId: 3,
    topicName: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
    changedContent: 'Tạo đề tài mới về IoT trong nông nghiệp thông minh',
    updatedBy: 'Hoàng Thị E',
    updatedAt: '2024-01-18T09:00:00',
    actionType: 'CREATE',
  },
  {
    id: 10,
    topicId: 4,
    topicName: 'Xây dựng hệ thống quản lý bệnh viện thông minh',
    changedContent: 'Cập nhật tóm tắt: Bổ sung thông tin về tích hợp AI để chẩn đoán và điều trị',
    updatedBy: 'Trần Văn G',
    updatedAt: '2024-01-26T10:15:00',
    actionType: 'UPDATE',
  },
  {
    id: 11,
    topicId: 4,
    topicName: 'Xây dựng hệ thống quản lý bệnh viện thông minh',
    changedContent: 'Cập nhật mục tiêu: Thêm mục tiêu về tối ưu hóa quy trình khám chữa bệnh',
    updatedBy: 'TS. Lê Thị H',
    updatedAt: '2024-01-25T14:45:00',
    actionType: 'UPDATE',
  },
  {
    id: 12,
    topicId: 4,
    topicName: 'Xây dựng hệ thống quản lý bệnh viện thông minh',
    changedContent: 'Tạo đề tài mới về hệ thống quản lý bệnh viện',
    updatedBy: 'Trần Văn G',
    updatedAt: '2024-01-22T16:20:00',
    actionType: 'CREATE',
  },
  {
    id: 13,
    topicId: 5,
    topicName: 'Phát triển ứng dụng thương mại điện tử sử dụng React Native',
    changedContent: 'Cập nhật phương pháp: Thêm sử dụng Redux Toolkit cho quản lý state',
    updatedBy: 'Phạm Văn I',
    updatedAt: '2024-01-24T11:30:00',
    actionType: 'UPDATE',
  },
  {
    id: 14,
    topicId: 5,
    topicName: 'Phát triển ứng dụng thương mại điện tử sử dụng React Native',
    changedContent: 'Cập nhật kết quả mong đợi: Điều chỉnh mục tiêu về hiệu suất ứng dụng',
    updatedBy: 'ThS. Nguyễn Thị J',
    updatedAt: '2024-01-23T09:45:00',
    actionType: 'UPDATE',
  },
  {
    id: 15,
    topicId: 5,
    topicName: 'Phát triển ứng dụng thương mại điện tử sử dụng React Native',
    changedContent: 'Tạo đề tài mới về ứng dụng thương mại điện tử',
    updatedBy: 'Phạm Văn I',
    updatedAt: '2024-01-21T13:15:00',
    actionType: 'CREATE',
  },
  {
    id: 16,
    topicId: 6,
    topicName: 'Nghiên cứu và phát triển hệ thống nhận dạng khuôn mặt',
    changedContent: 'Cập nhật tóm tắt: Bổ sung thông tin về ứng dụng trong an ninh và bảo mật',
    updatedBy: 'Vũ Thị K',
    updatedAt: '2024-01-25T15:20:00',
    actionType: 'UPDATE',
  },
  {
    id: 17,
    topicId: 6,
    topicName: 'Nghiên cứu và phát triển hệ thống nhận dạng khuôn mặt',
    changedContent: 'Cập nhật mục tiêu: Thêm mục tiêu về độ chính xác nhận dạng trên 95%',
    updatedBy: 'TS. Đỗ Văn L',
    updatedAt: '2024-01-24T08:50:00',
    actionType: 'UPDATE',
  },
  {
    id: 18,
    topicId: 6,
    topicName: 'Nghiên cứu và phát triển hệ thống nhận dạng khuôn mặt',
    changedContent: 'Tạo đề tài mới về nhận dạng khuôn mặt',
    updatedBy: 'Vũ Thị K',
    updatedAt: '2024-01-20T14:30:00',
    actionType: 'CREATE',
  },
  {
    id: 19,
    topicId: 7,
    topicName: 'Xây dựng hệ thống quản lý giao thông thông minh',
    changedContent: 'Cập nhật phương pháp: Sử dụng thêm Computer Vision và Deep Learning',
    updatedBy: 'Bùi Văn M',
    updatedAt: '2024-01-26T12:10:00',
    actionType: 'UPDATE',
  },
  {
    id: 20,
    topicId: 7,
    topicName: 'Xây dựng hệ thống quản lý giao thông thông minh',
    changedContent: 'Tạo đề tài mới về quản lý giao thông thông minh',
    updatedBy: 'Bùi Văn M',
    updatedAt: '2024-01-23T10:25:00',
    actionType: 'CREATE',
  },
  {
    id: 21,
    topicId: 8,
    topicName: 'Phát triển ứng dụng học trực tuyến sử dụng Flutter',
    changedContent: 'Xóa đề tài do không phù hợp với chương trình đào tạo',
    updatedBy: 'TS. Nguyễn Văn N',
    updatedAt: '2024-01-26T14:20:00',
    actionType: 'DELETE',
  },
  {
    id: 22,
    topicId: 9,
    topicName: 'Nghiên cứu ứng dụng AR/VR trong giáo dục',
    changedContent: 'Xóa đề tài do thiếu tài liệu tham khảo và cơ sở lý thuyết',
    updatedBy: 'ThS. Phạm Thị O',
    updatedAt: '2024-01-25T16:30:00',
    actionType: 'DELETE',
  },
  {
    id: 23,
    topicId: 10,
    topicName: 'Xây dựng hệ thống quản lý nhà hàng thông minh',
    changedContent: 'Cập nhật tóm tắt: Bổ sung thông tin về tích hợp AI cho gợi ý món ăn',
    updatedBy: 'Lê Văn P',
    updatedAt: '2024-01-26T11:45:00',
    actionType: 'UPDATE',
  },
  {
    id: 24,
    topicId: 10,
    topicName: 'Xây dựng hệ thống quản lý nhà hàng thông minh',
    changedContent: 'Tạo đề tài mới về quản lý nhà hàng thông minh',
    updatedBy: 'Lê Văn P',
    updatedAt: '2024-01-24T09:15:00',
    actionType: 'CREATE',
  },
  {
    id: 25,
    topicId: 11,
    topicName: 'Phát triển chatbot hỗ trợ khách hàng sử dụng NLP',
    changedContent: 'Cập nhật mục tiêu: Thêm mục tiêu về hỗ trợ đa ngôn ngữ',
    updatedBy: 'Trần Thị Q',
    updatedAt: '2024-01-25T13:25:00',
    actionType: 'UPDATE',
  },
  {
    id: 26,
    topicId: 11,
    topicName: 'Phát triển chatbot hỗ trợ khách hàng sử dụng NLP',
    changedContent: 'Tạo đề tài mới về chatbot hỗ trợ khách hàng',
    updatedBy: 'Trần Thị Q',
    updatedAt: '2024-01-22T15:40:00',
    actionType: 'CREATE',
  },
];

export default function TopicHistoryPage() {
  const [selectedHistory, setSelectedHistory] = useState<TopicHistory | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [topicHistory, setTopicHistory] = useState<TopicHistory[]>([]);
  const [stats, setStats] = useState({
    totalChanges: 0,
    createCount: 0,
    updateCount: 0,
    deleteCount: 0,
    uniqueTopics: 0,
    uniqueUsers: [] as string[],
  });

  // Load data on component mount
  useEffect(() => {
    loadTopicHistory();
  }, []);

  const loadTopicHistory = async (filters?: TopicHistoryFilters) => {
    setLoading(true);
    try {
      // Sử dụng mock data thay vì gọi API
      let data = [...mockTopicHistory];
      
      // Apply filters
      if (filters?.searchText) {
        data = data.filter(item => 
          item.topicName.toLowerCase().includes(filters.searchText!.toLowerCase()) ||
          item.changedContent.toLowerCase().includes(filters.searchText!.toLowerCase()) ||
          item.updatedBy.toLowerCase().includes(filters.searchText!.toLowerCase())
        );
      }
      
      if (filters?.actionType && filters.actionType !== 'all') {
        data = data.filter(item => item.actionType === filters.actionType);
      }
      
      if (filters?.userFilter && filters.userFilter !== 'all') {
        data = data.filter(item => item.updatedBy === filters.userFilter);
      }
      
      setTopicHistory(data);
      
      // Calculate stats
      const uniqueTopics = new Set(data.map(h => h.topicId)).size;
      const uniqueUsers = Array.from(new Set(data.map(h => h.updatedBy)));
      const createCount = data.filter(h => h.actionType === 'CREATE').length;
      const updateCount = data.filter(h => h.actionType === 'UPDATE').length;
      const deleteCount = data.filter(h => h.actionType === 'DELETE').length;
      
      setStats({
        totalChanges: data.length,
        createCount,
        updateCount,
        deleteCount,
        uniqueTopics,
        uniqueUsers,
      });
    } catch (error) {
      console.error('Error loading topic history:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu lịch sử thay đổi');
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng dữ liệu đã được filter từ loadTopicHistory
  const filteredHistory = topicHistory;

  const handleViewDetails = (history: TopicHistory) => {
    setSelectedHistory(history);
    setIsModalVisible(true);
  };

  const handleRefresh = () => {
    const filters: TopicHistoryFilters = {
      searchText: searchText || undefined,
      actionType: actionFilter !== 'all' ? actionFilter as any : undefined,
      userFilter: userFilter !== 'all' ? userFilter : undefined,
    };
    loadTopicHistory(filters);
  };

  const handleSearch = () => {
    const filters: TopicHistoryFilters = {
      searchText: searchText || undefined,
      actionType: actionFilter !== 'all' ? actionFilter as any : undefined,
      userFilter: userFilter !== 'all' ? userFilter : undefined,
    };
    loadTopicHistory(filters);
  };

  // Auto search when filters change
  useEffect(() => {
    const filters: TopicHistoryFilters = {
      searchText: searchText || undefined,
      actionType: actionFilter !== 'all' ? actionFilter as any : undefined,
      userFilter: userFilter !== 'all' ? userFilter : undefined,
    };
    loadTopicHistory(filters);
  }, [searchText, actionFilter, userFilter]);

  const getActionColor = (actionType: string) => {
    return topicHistoryService.getActionColor(actionType);
  };

  const getActionText = (actionType: string) => {
    return topicHistoryService.getActionText(actionType);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return <PlusOutlined />;
      case 'UPDATE':
        return <EditOutlined />;
      case 'DELETE':
        return <DeleteOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: 'Đề tài',
      dataIndex: 'topicName',
      key: 'topicName',
      width: 180,
      fixed: 'left' as const,
      render: (text: string, record: TopicHistory) => (
        <div>
          <Text strong className="text-xs sm:text-sm">{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            ID: {record.topicId}
          </Text>
        </div>
      ),
    },
    {
      title: 'Nội dung thay đổi',
      dataIndex: 'changedContent',
      key: 'changedContent',
      width: 280,
      fixed: 'left' as const,
      render: (text: string) => (
        <div className="whitespace-normal break-words">
          <Text className="text-xs sm:text-sm leading-relaxed">
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Người cập nhật',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 120,
      render: (text: string) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-1" />
          <Text className="text-xs sm:text-sm">{text}</Text>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 100,
      render: (text: string) => (
        <div>
          <Text className="text-xs">{text.split('T')[0]}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {text.split('T')[1]?.split('.')[0]}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 80,
      render: (actionType: string) => (
        <Tag 
          color={getActionColor(actionType)} 
          icon={getActionIcon(actionType)}
          className="text-xs"
        >
          {getActionText(actionType)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 60,
      fixed: 'right' as const,
      render: (_: any, record: TopicHistory) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
          className="text-xs"
        >
          <span className="hidden sm:inline">Xem</span>
        </Button>
      ),
    },
  ];

  // Thống kê từ state
  const { totalChanges, createCount, updateCount, deleteCount, uniqueTopics, uniqueUsers } = stats;

  return (
    <Layout className="min-h-screen">
      <style jsx global>{`
        .topic-history-table .ant-table-tbody > tr > td {
          vertical-align: top;
          padding: 6px 8px;
        }
        
        .topic-history-table .ant-table-tbody > tr > td:nth-child(2) {
          max-width: 280px;
          word-wrap: break-word;
          white-space: normal;
        }
        
        .topic-history-table .ant-table-tbody > tr > td:nth-child(1),
        .topic-history-table .ant-table-tbody > tr > td:nth-child(2) {
          background-color: #fafafa;
        }
        
        .topic-history-table .ant-table-tbody > tr:hover > td:nth-child(1),
        .topic-history-table .ant-table-tbody > tr:hover > td:nth-child(2) {
          background-color: #f0f0f0;
        }
        
        .topic-history-table .ant-table-thead > tr > th:nth-child(1),
        .topic-history-table .ant-table-thead > tr > th:nth-child(2) {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .topic-history-table .ant-table-tbody > tr > td {
            padding: 4px 6px;
          }
          
          .topic-history-table .ant-table-tbody > tr > td:nth-child(2) {
            max-width: 200px;
          }
          
          .topic-history-table .ant-table-thead > tr > th {
            padding: 8px 6px;
            font-size: 12px;
          }
        }
        
        @media (max-width: 576px) {
          .topic-history-table .ant-table-tbody > tr > td:nth-child(2) {
            max-width: 150px;
          }
        }
        
        /* Modal responsive */
        .topic-history-modal .ant-modal-content {
          margin: 16px;
        }
        
        @media (max-width: 768px) {
          .topic-history-modal .ant-modal-content {
            margin: 8px;
          }
          
          .topic-history-modal .ant-modal-body {
            padding: 12px;
          }
        }
      `}</style>
      <Header />

      <Content className="p-2 sm:p-4 lg:p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#fff5f0] to-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 shadow-md">
            <Title level={2} className="m-0 text-[#ff6b35] text-lg sm:text-2xl">
              Lịch sử thay đổi đề tài
            </Title>
            <Text type="secondary" className="text-xs sm:text-sm">
              Theo dõi và quản lý lịch sử cập nhật của các đề tài
            </Text>
          </div>

          {/* Mock Data Notice */}
          <Alert
            message="Đang sử dụng dữ liệu mẫu"
            description="Trang này đang hiển thị dữ liệu mẫu để demo. Khi tích hợp với backend, dữ liệu sẽ được lấy từ API thực tế."
            type="info"
            showIcon
            className="mb-4 sm:mb-6"
            closable
          />

          {/* Statistics */}
          <Row gutter={[12, 12]} className="mb-4">
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card size="small" className="h-full">
                <Statistic
                  title="Tổng thay đổi"
                  value={totalChanges}
                  prefix={<HistoryOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card size="small" className="h-full">
                <Statistic
                  title="Tạo mới"
                  value={createCount}
                  prefix={<PlusOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card size="small" className="h-full">
                <Statistic
                  title="Cập nhật"
                  value={updateCount}
                  prefix={<EditOutlined />}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card size="small" className="h-full">
                <Statistic
                  title="Số đề tài"
                  value={uniqueTopics}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="mb-4" size="small">
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} md={8} lg={6}>
                <Input
                  placeholder="Tìm kiếm đề tài, nội dung, người cập nhật..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                />
              </Col>
              <Col xs={12} sm={12} md={6} lg={4}>
                <Select
                  placeholder="Hành động"
                  value={actionFilter}
                  onChange={setActionFilter}
                  className="w-full"
                  size="small"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="CREATE">Tạo mới</Option>
                  <Option value="UPDATE">Cập nhật</Option>
                  <Option value="DELETE">Xóa</Option>
                </Select>
              </Col>
              <Col xs={12} sm={12} md={6} lg={4}>
                <Select
                  placeholder="Người cập nhật"
                  value={userFilter}
                  onChange={setUserFilter}
                  className="w-full"
                  size="small"
                >
                  <Option value="all">Tất cả</Option>
                  {uniqueUsers.map(user => (
                    <Option key={user} value={user}>{user}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={4} lg={10}>
                <Space wrap size="small">
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                    size="small"
                  >
                    Làm mới
                  </Button>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                    size="small"
                  >
                    Tìm kiếm
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchText('');
                      setActionFilter('all');
                      setUserFilter('all');
                    }}
                    size="small"
                  >
                    Xóa bộ lọc
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card size="small">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={filteredHistory}
                rowKey="id"
                scroll={{ x: 800, y: 500 }}
                pagination={{
                  pageSize: 8,
                  showSizeChanger: true,
                  showQuickJumper: false,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total}`,
                  size: 'small',
                  responsive: true,
                }}
                size="small"
                className="topic-history-table"
              />
            </Spin>
          </Card>
        </div>
      </Content>

      {/* Modal chi tiết lịch sử */}
      <Modal
        title={
          <div className="flex items-center">
            <HistoryOutlined className="text-[#ff6b35] mr-2" />
            <span className="text-sm sm:text-base">Chi tiết lịch sử thay đổi</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width="90%"
        style={{ maxWidth: 800 }}
        footer={null}
        className="topic-history-modal"
      >
        {selectedHistory && (
          <div>
            {/* Thông tin cơ bản */}
            <Card size="small" className="mb-4">
              <Title level={4} className="text-[#ff6b35]">
                {selectedHistory.topicName}
              </Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="ID đề tài">
                  {selectedHistory.topicId}
                </Descriptions.Item>
                <Descriptions.Item label="Hành động">
                  <Tag color={getActionColor(selectedHistory.actionType)} icon={getActionIcon(selectedHistory.actionType)}>
                    {getActionText(selectedHistory.actionType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">
                  <div className="flex items-center">
                    <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                    {selectedHistory.updatedBy}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-1" />
                    {selectedHistory.updatedAt}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Nội dung thay đổi */}
            <Card size="small" className="mb-4">
              <Title level={5}>Nội dung thay đổi</Title>
              <Alert
                message={selectedHistory.changedContent}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Card>

              {/* Timeline cho đề tài này */}
              <Card size="small">
                <Title level={5}>Timeline thay đổi</Title>
                <Timeline>
                  {topicHistory
                    .filter(h => h.topicId === selectedHistory.topicId)
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((history, index) => (
                      <Timeline.Item
                        key={history.id}
                        color={getActionColor(history.actionType)}
                        dot={getActionIcon(history.actionType)}
                      >
                        <div className="mb-2">
                          <Text strong>{getActionText(history.actionType)}</Text>
                          <Tag color={getActionColor(history.actionType)} className="ml-2">
                            {history.actionType}
                          </Tag>
                        </div>
                        <Text type="secondary" className="text-sm">
                          {history.changedContent}
                        </Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {history.updatedBy} - {topicHistoryService.formatDateTime(history.updatedAt)}
                        </Text>
                      </Timeline.Item>
                    ))}
                </Timeline>
              </Card>
          </div>
        )}
      </Modal>

      <Footer />
    </Layout>
  );
}
