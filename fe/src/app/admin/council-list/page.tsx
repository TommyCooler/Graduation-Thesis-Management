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
    Tag,
    Spin,
    Space,
    Badge,
    Empty,
    Input,
    Select,
    message,
    Modal,
    Result
} from 'antd';
import {
    TeamOutlined,
    CalendarOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    LinkOutlined,
    FieldTimeOutlined,
    PlusOutlined,
    BookOutlined,
    CommentOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { CouncilResponse } from '../../../types/council';
import { councilService } from '../../../services/councilService';
import AdminHeader from '../../../components/combination/AdminHeader';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Helper function để lấy màu và text cho status đề tài
const getTopicStatusColor = (status: string) => {
    switch (status) {
        case 'PASS_CAPSTONE': return 'success'; // Xanh lá đậm - Đậu đồ án
        case 'FAIL_CAPSTONE': return 'error'; // Đỏ đậm - Rớt đồ án
        case 'RETAKING': return 'warning'; // Cam/vàng - Đang chấm lại
        case 'ASSIGNED_TO_COUNCIL': return 'processing'; // Xanh dương - Đã gán vào hội đồng
        case 'APPROVED': return 'success'; // Xanh lá - Đã duyệt
        case 'PENDING': return 'default'; // Xám - Chờ xử lý
        case 'REJECTED': return 'error'; // Đỏ - Từ chối
        case 'PASSED_REVIEW_3': return 'success'; // Xanh lá - Đã qua review
        case 'UNDER_REVIEW': return 'processing'; // Xanh dương - Đang xem xét
        case 'FAILED': return 'error'; // Đỏ - Không đạt
        case 'DRAFT': return 'default'; // Xám - Nháp
        case 'SUBMITTED': return 'processing'; // Xanh dương - Đã nộp
        case 'REVISION_REQUIRED': return 'warning'; // Cam/vàng - Yêu cầu sửa đổi
        default: return 'default';
    }
};

const getTopicStatusText = (status: string) => {
    switch (status) {
        case 'PASS_CAPSTONE': return 'Đậu đồ án';
        case 'FAIL_CAPSTONE': return 'Rớt đồ án';
        case 'RETAKING': return 'Đang chấm lại';
        case 'ASSIGNED_TO_COUNCIL': return 'Đã gán vào hội đồng';
        case 'PASSED_REVIEW_3': return 'Đã qua review';
        case 'APPROVED': return 'Đã duyệt';
        case 'PENDING': return 'Chờ xử lý';
        case 'REJECTED': return 'Từ chối';
        case 'UNDER_REVIEW': return 'Đang xem xét';
        case 'FAILED': return 'Không đạt';
        case 'DRAFT': return 'Nháp';
        case 'SUBMITTED': return 'Đã nộp';
        case 'REVISION_REQUIRED': return 'Yêu cầu sửa đổi';
        default: return status;
    }
};

const CouncilListPage: React.FC = () => {
    const router = useRouter();
    const [councils, setCouncils] = useState<CouncilResponse[]>([]);
    const [filteredCouncils, setFilteredCouncils] = useState<CouncilResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState<string>('all'); // 'all', 'councilName', 'topicTitle', 'teacherName'
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [semesterFilter, setSemesterFilter] = useState<string>('');

    // Modal states
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCouncil, setSelectedCouncil] = useState<CouncilResponse | null>(null);

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
            
            // Kiểm tra role ADMIN
            const normalizedRole = role?.toUpperCase().replace(/_/g, '');
            if (normalizedRole === 'ADMIN') {
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
        fetchCouncils();
    }, [isAuthorized]);

    useEffect(() => {
        applyFilters();
    }, [councils, searchText, searchType, statusFilter, semesterFilter]);

    const fetchCouncils = async () => {
        setLoading(true);
        try {
            const data = await councilService.getAllCouncils();
            setCouncils(data);
        } catch (error) {
            console.error('Error fetching councils:', error);
            messageApi.error('Không thể tải danh sách hội đồng');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...councils];

        // Search filter - Tìm theo loại đã chọn
        if (searchText && searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            
            filtered = filtered.filter(council => {
                // Nếu chọn "all", tìm theo tất cả tiêu chí
                if (searchType === 'all') {
                    // 1. Kiểm tra tên hội đồng
                    const councilNameMatch = council.councilName?.toLowerCase().includes(searchLower) || false;
                    
                    // 2. Kiểm tra tên đề tài (trong tất cả đề tài của hội đồng)
                    const topicTitleMatch = council.topic?.some(topic => {
                        const title = topic.title?.toLowerCase() || '';
                        return title.includes(searchLower);
                    }) || false;
                    
                    // 3. Kiểm tra tên giảng viên (createdBy của đề tài)
                    const teacherNameMatch = council.topic?.some(topic => {
                        const createdBy = topic.createdBy?.toLowerCase() || '';
                        return createdBy.includes(searchLower);
                    }) || false;
                    
                    // 4. Kiểm tra tên thành viên hội đồng (cũng có thể là giảng viên)
                    const memberNameMatch = council.councilMembers?.some(member => {
                        const fullName = member.fullName?.toLowerCase() || '';
                        return fullName.includes(searchLower);
                    }) || false;
                    
                    return councilNameMatch || topicTitleMatch || teacherNameMatch || memberNameMatch;
                }
                
                // Nếu chọn loại cụ thể, chỉ tìm theo loại đó
                if (searchType === 'councilName') {
                    return council.councilName?.toLowerCase().includes(searchLower) || false;
                }
                
                if (searchType === 'topicTitle') {
                    return council.topic?.some(topic => {
                        const title = topic.title?.toLowerCase() || '';
                        return title.includes(searchLower);
                    }) || false;
                }
                
                if (searchType === 'teacherName') {
                    // Tìm trong createdBy của đề tài và tên thành viên hội đồng
                    const teacherMatch = council.topic?.some(topic => {
                        const createdBy = topic.createdBy?.toLowerCase() || '';
                        return createdBy.includes(searchLower);
                    }) || false;
                    
                    const memberMatch = council.councilMembers?.some(member => {
                        const fullName = member.fullName?.toLowerCase() || '';
                        return fullName.includes(searchLower);
                    }) || false;
                    
                    return teacherMatch || memberMatch;
                }
                
                return true;
            });
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(council => council.status === statusFilter);
        }

        // Semester filter
        if (semesterFilter) {
            filtered = filtered.filter(council => council.semester === semesterFilter);
        }

        setFilteredCouncils(filtered);
    };

    const handleRefresh = () => {
        fetchCouncils();
    };

    const clearFilters = () => {
        setSearchText('');
        setSearchType('all');
        setStatusFilter('');
        setSemesterFilter('');
    };

    const getUniqueStatuses = () => {
        return [...new Set(councils.map(council => council.status))];
    };

    const getUniqueSemesters = () => {
        return [...new Set(councils.map(council => council.semester))];
    };

    const handleViewDetails = (council: CouncilResponse) => {
        setSelectedCouncil(council);
        setIsDetailModalVisible(true);
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
                        subTitle="Chỉ có Admin mới được phép truy cập trang này."
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
            <AdminHeader />

            <Content className="p-10 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <Title level={2} className="text-orange-500 mb-2">
                                    <TeamOutlined /> Danh sách hội đồng
                                </Title>
                                <Paragraph className="text-base text-gray-600">
                                    Xem và quản lý các hội đồng bảo vệ luận văn tốt nghiệp
                                </Paragraph>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => router.push('/admin/council')}
                                style={{
                                    backgroundColor: '#ff6b35',
                                    borderColor: '#ff6b35',
                                    borderRadius: '8px',
                                    height: '40px',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            >
                                Tạo hội đồng
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 shadow-lg">
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={12} md={10}>
                                <Input.Group compact>
                                    <Select
                                        value={searchType}
                                        onChange={setSearchType}
                                        style={{ width: '35%' }}
                                        size="large"
                                    >
                                        <Option value="all">Tất cả</Option>
                                        <Option value="councilName">Tên hội đồng</Option>
                                        <Option value="topicTitle">Tên đề tài</Option>
                                        <Option value="teacherName">Tên giảng viên</Option>
                                    </Select>
                                    <Input
                                        placeholder="Nhập từ khóa tìm kiếm..."
                                        prefix={<SearchOutlined />}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        size="large"
                                        style={{ width: '65%' }}
                                    />
                                </Input.Group>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <Select
                                    placeholder="Trạng thái"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    size="large"
                                    allowClear
                                    className="w-full"
                                >
                                    {getUniqueStatuses().map((status: string) => (
                                        <Option key={status} value={status}>
                                            <Badge
                                                status={councilService.getStatusColor(status) as any}
                                                text={councilService.getStatusDisplay(status)}
                                            />
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <Select
                                    placeholder="Học kỳ"
                                    value={semesterFilter}
                                    onChange={setSemesterFilter}
                                    size="large"
                                    allowClear
                                    className="w-full"
                                >
                                    {getUniqueSemesters().map((semester: string) => (
                                        <Option key={semester} value={semester}>
                                            {semester}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={24} md={6}>
                                <Space className="w-full justify-end" wrap>
                                    <Button onClick={clearFilters}>
                                        Xóa bộ lọc
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        loading={loading}
                                    >
                                        Làm mới
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Stats */}
                    {councils.length > 0 && (
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={12} sm={6}>
                                <Card className="text-center shadow-md hover:shadow-lg transition-all border-0" style={{ background: 'linear-gradient(135deg, #fff5f0 0%, #ffe5d6 100%)' }}>
                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <TeamOutlined className="text-white text-xl" />
                                    </div>
                                    <Title level={2} className="!mb-1 !text-orange-600 !font-bold">
                                        {councils.length}
                                    </Title>
                                    <Text className="text-gray-600 font-medium">Tổng hội đồng</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="text-center shadow-md hover:shadow-lg transition-all border-0" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <ClockCircleOutlined className="text-white text-xl" />
                                    </div>
                                    <Title level={2} className="!mb-1 !text-blue-600 !font-bold">
                                        {councils.filter(c => c.status === 'PLANNED').length}
                                    </Title>
                                    <Text className="text-gray-600 font-medium">Đã lên kế hoạch</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="text-center shadow-md hover:shadow-lg transition-all border-0" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <CheckCircleOutlined className="text-white text-xl" />
                                    </div>
                                    <Title level={2} className="!mb-1 !text-green-600 !font-bold">
                                        {councils.filter(c => c.status === 'COMPLETED').length}
                                    </Title>
                                    <Text className="text-gray-600 font-medium">Đã hoàn thành</Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="text-center shadow-md hover:shadow-lg transition-all border-0" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}>
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <EyeOutlined className="text-white text-xl" />
                                    </div>
                                    <Title level={2} className="!mb-1 !text-purple-600 !font-bold">
                                        {filteredCouncils.length}
                                    </Title>
                                    <Text className="text-gray-600 font-medium">Đang hiển thị</Text>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Council List */}
                    <Card className="shadow-lg">
                        <Spin spinning={loading} tip="Đang tải dữ liệu...">
                            {filteredCouncils.length === 0 && !loading ? (
                                <Empty
                                    description={
                                        councils.length === 0
                                            ? "Chưa có hội đồng nào được tạo"
                                            : "Không tìm thấy hội đồng phù hợp"
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <Space>
                                        <Button
                                            type="primary"
                                            href="/admin/council"
                                        >
                                            <TeamOutlined className="mr-2" />
                                            Tạo hội đồng mới
                                        </Button>
                                        {councils.length > 0 && (
                                            <Button onClick={clearFilters}>
                                                <FilterOutlined className="mr-2" />
                                                Xóa bộ lọc
                                            </Button>
                                        )}
                                    </Space>
                                </Empty>
                            ) : filteredCouncils.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredCouncils.map((council) => (
                                        <Card
                                            key={council.id}
                                            className="shadow-md hover:shadow-lg transition-all border-2 border-gray-100 hover:border-orange-200 rounded-xl overflow-hidden"
                                            title={
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                                            <TeamOutlined className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
                                                                {council.councilName}
                                                            </Title>
                                                            <Text className="text-gray-400 text-xs">
                                                                ID: {council.id} • {council.topic.length} đề tài • {council.councilMembers.length} thành viên
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <Tag
                                                        color={councilService.getStatusColor(council.status)}
                                                        className="text-sm font-semibold px-4 py-1.5 rounded-full"
                                                    >
                                                        {councilService.getStatusDisplay(council.status)}
                                                    </Tag>
                                                </div>
                                            }
                                            extra={
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => handleViewDetails(council)}
                                                    style={{ 
                                                        backgroundColor: '#ff6b35', 
                                                        borderColor: '#ff6b35',
                                                        borderRadius: '8px',
                                                        height: '40px',
                                                        fontSize: '14px',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            }
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} md={12}>
                                                    <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <BookOutlined className="text-orange-500" />
                                                            <Text type="secondary" className="text-sm font-semibold">
                                                                Đề tài ({council.topic.length})
                                                            </Text>
                                                        </div>
                                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                                            {council.topic.length > 0 ? (
                                                                council.topic.map((topic, index) => (
                                                                    <div 
                                                                        key={topic.id} 
                                                                        className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200 hover:border-orange-300 transition-colors"
                                                                    >
                                                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                                                            {index + 1}
                                                                        </span>
                                                                        <Text className="text-sm text-gray-800 line-clamp-2 flex-1">
                                                                            {topic.title}
                                                                        </Text>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <Text className="text-gray-400 text-sm">Chưa có đề tài</Text>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Row gutter={[12, 12]}>
                                                        <Col xs={12}>
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                                <Text type="secondary" className="text-xs">Học kỳ</Text>
                                                                <div className="font-semibold text-gray-800 mt-1 text-sm">
                                                                    {council.semester}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                                                <Text type="secondary" className="text-xs">Ngày tổ chức</Text>
                                                                <div className="font-semibold text-gray-800 mt-1 text-xs">
                                                                    {councilService.formatDate(council.date)}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                        {council.retakeDate && (
                                                            <Col xs={24}>
                                                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarOutlined className="text-red-600 text-xs" />
                                                                        <div>
                                                                            <Text type="secondary" className="text-xs">Ngày chấm lại</Text>
                                                                            <div className="font-semibold text-red-600 mt-0.5 text-xs">
                                                                                {councilService.formatDate(council.retakeDate)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        )}
                                                        <Col xs={24}>
                                                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <TeamOutlined className="text-purple-500 text-sm" />
                                                                    <Text type="secondary" className="text-xs font-semibold">Thành viên ({council.councilMembers.length})</Text>
                                                                </div>
                                                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                                                    {council.councilMembers.slice(0, 4).map((member) => (
                                                                        <div key={member.id} className="flex items-center gap-2 text-xs">
                                                                            <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                                                {member.fullName.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <span className="text-gray-700">{member.fullName}</span>
                                                                        </div>
                                                                    ))}
                                                                    {council.councilMembers.length > 4 && (
                                                                        <div className="text-gray-500 text-xs pt-1 border-t border-purple-200">
                                                                            +{council.councilMembers.length - 4} thành viên khác
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </div>
                            ) : null}
                        </Spin>
                    </Card>
                </div>
            </Content>

            <Footer />

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                            <TeamOutlined className="text-white text-lg" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800">Chi tiết hội đồng</div>
                            {selectedCouncil && (
                                <div className="text-xs text-gray-500">{selectedCouncil.councilName}</div>
                            )}
                        </div>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={1600}
                style={{ top: 20 }}
                bodyStyle={{ maxHeight: 'calc(100vh - 120px)', padding: '24px' }}
                className="council-detail-modal"
            >
                {selectedCouncil && (
                    <div className="space-y-4">
                        {/* Header Info - Enhanced */}
                        <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-xl border border-orange-100 mb-4">
                            <Row gutter={[16, 12]}>
                                <Col xs={24} sm={12} md={8}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <TeamOutlined className="text-blue-600" />
                                        </div>
                                        <div>
                                            <Text type="secondary" className="text-xs">Tên hội đồng</Text>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {selectedCouncil.councilName}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <div>
                                        <Text type="secondary" className="text-xs">Trạng thái</Text>
                                        <div className="mt-1">
                                            <Tag
                                                color={councilService.getStatusColor(selectedCouncil.status)}
                                                className="text-xs font-semibold px-3 py-1 rounded-full"
                                            >
                                                {councilService.getStatusDisplay(selectedCouncil.status)}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <div>
                                        <Text type="secondary" className="text-xs">Học kỳ</Text>
                                        <div className="mt-1">
                                            <Tag color="orange" className="text-xs font-semibold px-2 py-1 rounded-full">
                                                {selectedCouncil.semester}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={selectedCouncil.retakeDate ? 6 : 8}>
                                    <div className="flex items-center gap-2">
                                        <CalendarOutlined className="text-green-600 text-base" />
                                        <div>
                                            <Text type="secondary" className="text-xs">Ngày tổ chức</Text>
                                            <div className="font-semibold text-gray-800 text-sm">
                                                {councilService.formatDate(selectedCouncil.date)}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                {selectedCouncil.retakeDate && (
                                    <Col xs={24} sm={12} md={6}>
                                        <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-red-600 text-base" />
                                            <div>
                                                <Text type="secondary" className="text-xs">Ngày chấm lại</Text>
                                                <div className="font-semibold text-red-600 text-sm">
                                                    {councilService.formatDate(selectedCouncil.retakeDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* Main Content - 2 Columns */}
                        <Row gutter={[24, 0]}>
                            {/* Left Column - Topics */}
                            <Col span={16}>
                                <div className="pr-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <BookOutlined className="text-orange-500 text-xl" />
                                            <Text strong className="text-lg">Đề tài ({selectedCouncil.topic.length})</Text>
                                        </div>
                                    </div>
                                    <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-3" style={{ scrollbarWidth: 'thin' }}>
                                        {selectedCouncil.topic.length > 0 ? (
                                            selectedCouncil.topic.map((topic, index) => (
                                                <Card
                                                    key={topic.id}
                                                    className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all mb-4 rounded-xl"
                                                    size="default"
                                                    bodyStyle={{ padding: '20px' }}
                                                >
                                                    <div className="space-y-4">
                                                        {/* Topic Header */}
                                                        <div className="flex items-start gap-4">
                                                            <span className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 shadow-md">
                                                                {index + 1}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                                    <Text strong className="text-lg !mb-0 text-gray-800 leading-relaxed">
                                                                        {topic.title}
                                                                    </Text>
                                                                    <Tag 
                                                                        color={getTopicStatusColor(topic.status || '')} 
                                                                        className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full"
                                                                        style={{
                                                                            fontSize: '13px',
                                                                            fontWeight: 600,
                                                                            border: 'none'
                                                                        }}
                                                                    >
                                                                        {getTopicStatusText(topic.status || '')}
                                                                    </Tag>
                                                                </div>
                                                                {topic.description && (
                                                                    <Text className="text-base text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                                                                        {topic.description}
                                                                    </Text>
                                                                )}
                                                                <div className="flex flex-wrap gap-3 mt-3">
                                                                    {topic.createdBy && (
                                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                                                            <UserOutlined className="text-blue-600 text-sm" />
                                                                            <Text className="text-sm text-gray-700 truncate font-medium" title={topic.createdBy}>
                                                                                {topic.createdBy}
                                                                            </Text>
                                                                        </div>
                                                                    )}
                                                                    {topic.submitedAt && (
                                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                                                                            <CalendarOutlined className="text-green-600 text-sm" />
                                                                            <Text className="text-sm text-gray-700 font-medium">
                                                                                {new Date(topic.submitedAt).toLocaleDateString('vi-VN')}
                                                                            </Text>
                                                                        </div>
                                                                    )}
                                                                    {(topic as any).defenseTime && (
                                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
                                                                            <FieldTimeOutlined className="text-orange-600 text-sm" />
                                                                            <Text className="text-sm text-gray-700 font-semibold">
                                                                                {(topic as any).defenseTime.substring(0, 5)}
                                                                            </Text>
                                                                        </div>
                                                                    )}
                                                                    {topic.filePathUrl && (
                                                                        <a
                                                                            href={topic.filePathUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100 text-purple-600 hover:text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium"
                                                                        >
                                                                            <LinkOutlined />
                                                                            <span>File</span>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Notes Section */}
                                                        {topic.notes && topic.notes.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <MessageOutlined className="text-blue-500 text-base" />
                                                                    <Text strong className="text-sm text-gray-700">
                                                                        Ghi chú ({topic.notes.length})
                                                                    </Text>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {topic.notes.map((note, noteIndex) => (
                                                                        <div 
                                                                            key={noteIndex}
                                                                            className="p-4 bg-blue-50 rounded-lg border-2 border-blue-100 hover:border-blue-200 transition-colors"
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <CommentOutlined className="text-blue-500 text-sm mt-1 flex-shrink-0" />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                                                            {note.accountName?.charAt(0).toUpperCase() || '?'}
                                                                                        </div>
                                                                                        <Text className="text-sm font-semibold text-gray-700">
                                                                                            {note.accountName || 'Không xác định'}
                                                                                        </Text>
                                                                                    </div>
                                                                                    <Text className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                                                        {note.note}
                                                                                    </Text>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Text className="text-gray-400 text-sm">Chưa có đề tài</Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Col>

                            {/* Right Column - Members */}
                            <Col span={8}>
                                <div className="pl-4 border-l-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TeamOutlined className="text-purple-500 text-lg" />
                                        <Text strong className="text-base">Thành viên ({selectedCouncil.councilMembers.length})</Text>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                        {selectedCouncil.councilMembers.map((member) => (
                                            <Card
                                                key={member.id}
                                                className="shadow-sm hover:shadow-md transition-all border border-gray-200 rounded-lg"
                                                size="small"
                                                bodyStyle={{ padding: '12px' }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-sm">
                                                        {member.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <Text strong className="text-sm text-gray-800">
                                                                {member.fullName}
                                                            </Text>
                                                            <Tag 
                                                                color={councilService.getRoleColor(member.role)} 
                                                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                            >
                                                                {councilService.getRoleDisplay(member.role)}
                                                            </Tag>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <UserOutlined className="text-gray-400 text-xs" />
                                                                <Text className="text-xs text-gray-600 truncate" title={member.email}>
                                                                    {member.email}
                                                                </Text>
                                                            </div>
                                                            {member.phoneNumber && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <FileTextOutlined className="text-gray-400 text-xs" />
                                                                    <Text className="text-xs text-gray-600">
                                                                        {member.phoneNumber}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t mt-3">
                            <Button 
                                size="large"
                                onClick={() => setIsDetailModalVisible(false)}
                                style={{ 
                                    borderRadius: '8px',
                                    height: '40px',
                                    fontSize: '14px'
                                }}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default CouncilListPage;

