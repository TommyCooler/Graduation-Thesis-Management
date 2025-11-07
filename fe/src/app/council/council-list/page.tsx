'use client';

import React, { useState, useEffect } from 'react';
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
    Modal
} from 'antd';
import {
    TeamOutlined,
    CalendarOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { CouncilResponse } from '../../../types/council';
import { councilService } from '../../../services/councilService';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const CouncilListPage: React.FC = () => {
    const [councils, setCouncils] = useState<CouncilResponse[]>([]);
    const [filteredCouncils, setFilteredCouncils] = useState<CouncilResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isMounted, setIsMounted] = useState(false);

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [semesterFilter, setSemesterFilter] = useState<string>('');

    // Modal states
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCouncil, setSelectedCouncil] = useState<CouncilResponse | null>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchCouncils();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [councils, searchText, statusFilter, semesterFilter]);

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

        // Search filter
        if (searchText) {
            filtered = filtered.filter(council =>
                council.councilName.toLowerCase().includes(searchText.toLowerCase()) ||
                council.topic.some(topic => topic.title.toLowerCase().includes(searchText.toLowerCase()))
            );
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

    const handleEdit = (councilId: number) => {
        messageApi.info(`Chỉnh sửa hội đồng ${councilId}`);
    };

    const handleDelete = async (councilId: number) => {
        try {
            await councilService.deleteCouncil(councilId);
            messageApi.success('Xóa hội đồng thành công');
            fetchCouncils();
        } catch (error) {
            messageApi.error('Không thể xóa hội đồng');
        }
    };

    if (!isMounted) {
        return null;
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
                            <TeamOutlined /> Danh sách hội đồng
                        </Title>
                        <Paragraph className="text-base text-gray-600">
                            Xem và quản lý các hội đồng bảo vệ luận văn tốt nghiệp
                        </Paragraph>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 shadow-lg">
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={12} md={10}>
                                <Input
                                    placeholder="Tìm kiếm theo tên hội đồng, đề tài..."
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    size="large"
                                />
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
                                            href="/council"
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
                                            className="shadow-sm hover:shadow-md transition-all"
                                            title={
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <TeamOutlined className="text-orange-500 text-xl" />
                                                        <div>
                                                            <Title level={4} className="!mb-0 !text-gray-800">
                                                                {council.councilName}
                                                            </Title>
                                                            <Text className="text-gray-500 text-sm">
                                                                ID: {council.id}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <Tag
                                                        color={councilService.getStatusColor(council.status)}
                                                        className="text-sm font-semibold px-3 py-1"
                                                    >
                                                        {councilService.getStatusDisplay(council.status)}
                                                    </Tag>
                                                </div>
                                            }
                                            extra={
                                                <Space wrap>
                                                    <Button
                                                        type="primary"
                                                        icon={<EyeOutlined />}
                                                        onClick={() => handleViewDetails(council)}
                                                        style={{ backgroundColor: '#ff6b35', borderColor: '#ff6b35' }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEdit(council.id)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => handleDelete(council.id)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Space>
                                            }
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12} md={8}>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <Text type="secondary" className="text-sm">Đề tài</Text>
                                                        <div className="font-medium text-gray-800 mt-1">
                                                            {council.topic.length > 0 ? (
                                                                <>
                                                                    {council.topic[0].title.length > 30
                                                                        ? `${council.topic[0].title.substring(0, 30)}...`
                                                                        : council.topic[0].title}
                                                                    {council.topic.length > 1 && ` (+${council.topic.length - 1})`}
                                                                </>
                                                            ) : 'N/A'}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={6} md={4}>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <Text type="secondary" className="text-sm">Học kỳ</Text>
                                                        <div className="font-medium text-gray-800 mt-1">
                                                            {council.semester}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={6} md={6}>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <Text type="secondary" className="text-sm">Ngày tổ chức</Text>
                                                        <div className="font-medium text-gray-800 mt-1 text-sm">
                                                            {councilService.formatDate(council.date)}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={24} sm={12} md={6}>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <Text type="secondary" className="text-sm">Thành viên</Text>
                                                        <div className="font-medium text-gray-800 mt-1">
                                                            <TeamOutlined className="mr-1" />
                                                            {council.councilMembers.length} người
                                                        </div>
                                                    </div>
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
                    <div className="flex items-center">
                        <TeamOutlined className="text-orange-500 mr-2" />
                        <span>Chi tiết hội đồng</span>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={900}
            >
                {selectedCouncil && (
                    <div className="space-y-4 mt-4">
                        {/* Council Basic Info */}
                        <Card title="Thông tin hội đồng" className="border-0 shadow-sm">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" className="text-sm">Tên hội đồng</Text>
                                        <div className="font-semibold text-gray-800 mt-1">
                                            {selectedCouncil.councilName}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" className="text-sm">Trạng thái</Text>
                                        <div className="mt-1">
                                            <Tag
                                                color={councilService.getStatusColor(selectedCouncil.status)}
                                                className="text-sm font-semibold px-3 py-1"
                                            >
                                                {councilService.getStatusDisplay(selectedCouncil.status)}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            
                            <div className="mt-4">
                                <Text type="secondary" className="text-sm">Đề tài ({selectedCouncil.topic.length})</Text>
                                <div className="space-y-2 mt-2">
                                    {selectedCouncil.topic.length > 0 ? (
                                        selectedCouncil.topic.map((topic, index) => (
                                            <div key={topic.id} className="p-2 bg-gray-50 rounded border-l-4 border-orange-500">
                                                <Text strong className="text-gray-800">
                                                    {index + 1}. {topic.title}
                                                </Text>
                                            </div>
                                        ))
                                    ) : (
                                        <Text className="text-gray-500">Chưa có đề tài</Text>
                                    )}
                                </div>
                            </div>

                            <Row gutter={[16, 16]} className="mt-4">
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" className="text-sm">Học kỳ</Text>
                                        <div className="mt-1">
                                            <Tag color="orange">{selectedCouncil.semester}</Tag>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" className="text-sm">Ngày tổ chức</Text>
                                        <div className="flex items-center mt-1">
                                            <CalendarOutlined className="mr-2 text-gray-500" />
                                            <Text>{councilService.formatDate(selectedCouncil.date)}</Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Council Members */}
                        <Card title={`Thành viên hội đồng (${selectedCouncil.councilMembers.length})`} className="border-0 shadow-sm">
                            <div className="space-y-3">
                                {selectedCouncil.councilMembers.map((member) => (
                                    <div key={member.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                {member.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Text strong className="text-gray-800">
                                                        {member.fullName}
                                                    </Text>
                                                    <Tag color={councilService.getRoleColor(member.role)}>
                                                        {councilService.getRoleDisplay(member.role)}
                                                    </Tag>
                                                </div>
                                                <Text className="text-gray-600 text-sm block">
                                                    {member.email}
                                                </Text>
                                                {member.phoneNumber && (
                                                    <Text className="text-gray-600 text-sm">
                                                        {member.phoneNumber}
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button onClick={() => setIsDetailModalVisible(false)}>
                                Đóng
                            </Button>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setIsDetailModalVisible(false);
                                    handleEdit(selectedCouncil.id);
                                }}
                                style={{ backgroundColor: '#ff6b35', borderColor: '#ff6b35' }}
                            >
                                Chỉnh sửa
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default CouncilListPage;
