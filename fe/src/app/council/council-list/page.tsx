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
    Divider,
    Space,
    Avatar,
    Descriptions,
    Badge,
    Empty,
    Input,
    Select,
    DatePicker,
    message,
    Modal
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { CouncilResponse } from '../../../types/council';
import { councilService } from '../../../services/councilService';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CouncilListPage: React.FC = () => {
    const [councils, setCouncils] = useState<CouncilResponse[]>([]);
    const [filteredCouncils, setFilteredCouncils] = useState<CouncilResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [semesterFilter, setSemesterFilter] = useState<string>('');

    // Modal states
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCouncil, setSelectedCouncil] = useState<CouncilResponse | null>(null);

    useEffect(() => {
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
            messageApi.success(`Tải thành công ${data.length} hội đồng`);
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
                council.topicName.toLowerCase().includes(searchText.toLowerCase())
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
    };    const renderCouncilCard = (council: CouncilResponse) => (
        <Card
            key={council.id}
            className="mb-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50"
            title={
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
                            <TeamOutlined className="text-white text-base" />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800 text-xl">{council.councilName}</span>
                            <div className="text-sm text-gray-500 mt-1">ID: {council.id}</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <Tag
                            color={councilService.getStatusColor(council.status)}
                            className="text-sm font-medium px-3 py-1 rounded-full border-0"
                        >
                            {councilService.getStatusDisplay(council.status)}
                        </Tag>
                    </div>
                </div>
            }
            extra={
                <Space wrap>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(council)}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-md hover:shadow-lg"
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(council.id)}
                        className="rounded-xl border-blue-400 text-blue-600 hover:bg-blue-50"
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        ghost
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(council.id)}
                        className="rounded-xl"
                    >
                        Xóa
                    </Button>
                </Space>
            }
        >
            {/* Thông tin tóm tắt */}
            <div className="p-4">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Đề tài</div>
                            <div className="font-medium text-gray-800 text-sm truncate" title={council.topicName}>
                                {council.topicName.length > 20 ? `${council.topicName.substring(0, 20)}...` : council.topicName}
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Học kỳ</div>
                            <div className="font-medium text-gray-800">{council.semester}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Slot</div>
                            <div className="font-medium text-gray-800">Slot {council.slot}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={5}>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Ngày tổ chức</div>
                            <div className="font-medium text-gray-800 text-sm">
                                {councilService.formatDate(council.date)}
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={5}>
                        <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Thành viên</div>
                            <div className="font-medium text-gray-800 flex items-center justify-center">
                                <TeamOutlined className="mr-1" />
                                {council.councilMembers.length} người
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );    const handleViewDetails = (council: CouncilResponse) => {
        setSelectedCouncil(council);
        setIsDetailModalVisible(true);
    };

    const handleEdit = (councilId: number) => {
        // Navigate to edit page
        messageApi.info(`Chỉnh sửa hội đồng ${councilId}`);
    };

    const handleDelete = async (councilId: number) => {
        try {
            await councilService.deleteCouncil(councilId);
            messageApi.success('Xóa hội đồng thành công');
            fetchCouncils(); // Refresh list
        } catch (error) {
            messageApi.error('Không thể xóa hội đồng');
        }
    };

    return (
        <Layout className="min-h-screen">
            {contextHolder}
            <Header />

            <Content>        {/* Hero Section - Compact */}
                <div className="relative bg-gradient-to-br from-orange-50 via-white to-orange-30 py-12 px-6 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-10 left-10 w-24 h-24 bg-orange-400 rounded-full"></div>
                        <div className="absolute top-20 right-20 w-16 h-16 bg-orange-300 rounded-full"></div>
                        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-orange-200 rounded-full"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mx-auto mb-4 transform hover:scale-105 transition-transform duration-300">
                                <TeamOutlined className="text-2xl text-white" />
                            </div>
                            <Title level={1} className="text-4xl mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Quản lý <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Hội đồng</span>
                            </Title>
                            <Paragraph className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                                Hệ thống quản lý toàn diện các hội đồng bảo vệ luận văn tốt nghiệp
                            </Paragraph>

                            {/* Quick Actions */}
                            <div className="flex justify-center space-x-3 mt-6">
                                <Button
                                    type="primary"
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-6"
                                    href="/council"
                                >
                                    <TeamOutlined className="mr-2" />
                                    Tạo hội đồng mới
                                </Button>
                                <Button
                                    className="border-orange-300 text-orange-600 hover:border-orange-500 hover:text-orange-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 px-6"
                                    onClick={handleRefresh}
                                >
                                    <ReloadOutlined className="mr-2" />
                                    Làm mới dữ liệu
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>{/* Advanced Filters */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 -m-6 mb-6 p-6">
                                <Title level={4} className="text-white mb-0 flex items-center">
                                    <FilterOutlined className="mr-3" />
                                    Bộ lọc và tìm kiếm nâng cao
                                </Title>
                            </div>

                            <Row gutter={[24, 24]} align="middle">
                                <Col xs={24} lg={10}>
                                    <div className="relative">
                                        <Input
                                            placeholder="Tìm kiếm theo tên hội đồng, đề tài..."
                                            prefix={<SearchOutlined className="text-orange-400" />}
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            size="large"
                                            className="rounded-xl border-gray-200 hover:border-orange-400 focus:border-orange-500 shadow-sm"
                                        />
                                    </div>
                                </Col>

                                <Col xs={12} lg={4}>
                                    <Select
                                        placeholder="Trạng thái"
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        size="large"
                                        className="w-full rounded-xl"
                                        allowClear
                                        suffixIcon={<FilterOutlined className="text-orange-400" />}
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

                                <Col xs={12} lg={4}>
                                    <Select
                                        placeholder="Học kỳ"
                                        value={semesterFilter}
                                        onChange={setSemesterFilter}
                                        size="large"
                                        className="w-full rounded-xl"
                                        allowClear
                                        suffixIcon={<CalendarOutlined className="text-orange-400" />}
                                    >
                                        {getUniqueSemesters().map((semester: string) => (
                                            <Option key={semester} value={semester}>
                                                {semester}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>

                                <Col xs={24} lg={6}>
                                    <Space className="w-full flex justify-end" wrap>
                                        <Button
                                            icon={<FilterOutlined />}
                                            onClick={clearFilters}
                                            className="rounded-xl border-gray-200 hover:border-orange-400 hover:text-orange-600"
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<ReloadOutlined />}
                                            onClick={handleRefresh}
                                            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-md hover:shadow-lg"
                                        >
                                            Làm mới
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </div>       \
                 {/* Main Content */}
                <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen py-12 px-6">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-orange-100 to-transparent rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-20 blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full opacity-40 blur-2xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">                         {/* Compact Stats Dashboard */}
                        <div className="mb-6">
                            <Title level={5} className="text-center mb-4 text-gray-600">
                                Thống kê tổng quan
                            </Title>
                            <Row gutter={[12, 12]}>
                                <Col xs={12} lg={6}>            
                                <Card className="text-center border-0 shadow-sm rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-all duration-300">
                                    <div className="p-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <TeamOutlined className="text-sm text-white" />
                                        </div>
                                        <div className="text-lg font-bold text-orange-600 mb-1">
                                            {councils.length}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">Tổng hội đồng</div>
                                    </div>
                                </Card>
                                </Col>
                                <Col xs={12} lg={6}>                  
                                <Card className="text-center border-0 shadow-sm rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-all duration-300">
                                    <div className="p-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <CalendarOutlined className="text-sm text-white" />
                                        </div>
                                        <div className="text-lg font-bold text-blue-600 mb-1">
                                            {councils.filter(c => c.status === 'PLANNED').length}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">Đã lên kế hoạch</div>
                                    </div>
                                </Card>
                                </Col>                
                                <Col xs={12} lg={6}>
                                    <Card className="text-center border-0 shadow-sm rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-all duration-300">
                                        <div className="p-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                                                <CheckCircleOutlined className="text-sm text-white" />
                                            </div>
                                            <div className="text-lg font-bold text-green-600 mb-1">
                                                {councils.filter(c => c.status === 'COMPLETED').length}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium">Đã hoàn thành</div>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={12} lg={6}>
                                    <Card className="text-center border-0 shadow-sm rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-all duration-300">
                                        <div className="p-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                                                <EyeOutlined className="text-sm text-white" />
                                            </div>
                                            <div className="text-lg font-bold text-purple-600 mb-1">
                                                {filteredCouncils.length}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium">Hiển thị</div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </div>{/* Council List */}
                        {loading ? (
                            <Card className="text-center py-20 border-0 shadow-lg rounded-2xl">
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <Spin size="large" />
                                        <div className="absolute inset-0 animate-ping">
                                            <div className="w-12 h-12 bg-orange-200 rounded-full opacity-25"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <Title level={4} className="text-gray-600 mb-2">Đang tải dữ liệu...</Title>
                                        <Paragraph className="text-gray-500">Vui lòng chờ trong giây lát</Paragraph>
                                    </div>
                                </div>
                            </Card>
                        ) : filteredCouncils.length > 0 ? (
                            <div className="space-y-8">
                                {filteredCouncils.map(renderCouncilCard)}

                                {/* Load More Button */}
                                <div className="text-center mt-12">
                                    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 py-8">
                                        <Title level={4} className="text-gray-700 mb-4">
                                            Đã hiển thị tất cả {filteredCouncils.length} hội đồng
                                        </Title>
                                        <Space>
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-lg rounded-xl px-8"
                                                href="/council"
                                            >
                                                <TeamOutlined className="mr-2" />
                                                Tạo hội đồng mới
                                            </Button>
                                            <Button
                                                size="large"
                                                onClick={handleRefresh}
                                                className="border-orange-300 text-orange-600 hover:border-orange-500 rounded-xl px-8"
                                            >
                                                <ReloadOutlined className="mr-2" />
                                                Tải lại
                                            </Button>
                                        </Space>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <Card className="text-center py-20 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="max-w-md mx-auto">
                                    <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <TeamOutlined className="text-6xl text-gray-400" />
                                    </div>
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="space-y-4">
                                                <Title level={4} className="text-gray-600">
                                                    {councils.length === 0
                                                        ? "Chưa có hội đồng nào được tạo"
                                                        : "Không tìm thấy hội đồng phù hợp"
                                                    }
                                                </Title>
                                                <Paragraph className="text-gray-500">
                                                    {councils.length === 0
                                                        ? "Hãy tạo hội đồng đầu tiên của bạn để bắt đầu quản lý luận văn tốt nghiệp"
                                                        : "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy kết quả phù hợp"
                                                    }
                                                </Paragraph>
                                            </div>
                                        }
                                    >
                                        <Space className="mt-8">
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 border-none shadow-lg rounded-xl px-8"
                                                href="/council"
                                            >
                                                <TeamOutlined className="mr-2" />
                                                Tạo hội đồng mới
                                            </Button>
                                            {councils.length > 0 && (
                                                <Button
                                                    size="large"
                                                    onClick={clearFilters}
                                                    className="border-orange-300 text-orange-600 hover:border-orange-500 rounded-xl px-8"
                                                >
                                                    <FilterOutlined className="mr-2" />
                                                    Xóa bộ lọc
                                                </Button>
                                            )}
                                        </Space>
                                    </Empty>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </Content>            <Divider className="my-0" />
            <Footer />

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                            <TeamOutlined className="text-white text-sm" />
                        </div>
                        <span className="text-lg font-semibold">Chi tiết hội đồng</span>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={1000}
                className="top-6"
            >
                {selectedCouncil && (
                    <div className="space-y-6 mt-4">
                        {/* Council Basic Info */}
                        <Card 
                            size="small" 
                            className="border-0 shadow-md rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
                            title={
                                <div className="flex items-center text-blue-700">
                                    <CalendarOutlined className="mr-2" />
                                    <span className="font-semibold">Thông tin hội đồng</span>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="text-sm text-gray-500 mb-2">Tên hội đồng</div>
                                            <div className="font-semibold text-gray-800 text-base">
                                                {selectedCouncil.councilName}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="text-sm text-gray-500 mb-2">Trạng thái</div>
                                            <Tag 
                                                color={councilService.getStatusColor(selectedCouncil.status)}
                                                className="text-sm font-medium px-3 py-1 rounded-full border-0"
                                            >
                                                {councilService.getStatusDisplay(selectedCouncil.status)}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-sm text-gray-500 mb-3">Đề tài</div>
                                    <div className="text-base font-semibold text-gray-800 leading-relaxed">
                                        {selectedCouncil.topicName}
                                    </div>
                                </div>

                                <Row gutter={[16, 16]}>
                                    <Col span={8}>
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="text-sm text-gray-500 mb-2">Học kỳ</div>
                                            <div className="flex items-center">
                                                <Badge color="orange" />
                                                <span className="font-medium text-gray-700 ml-2">{selectedCouncil.semester}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="text-sm text-gray-500 mb-2">Slot</div>
                                            <div className="flex items-center">
                                                <ClockCircleOutlined className="text-orange-500 mr-2" />
                                                <span className="font-medium text-gray-700">Slot {selectedCouncil.slot}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <div className="text-sm text-gray-500 mb-2">Ngày tổ chức</div>
                                            <div className="flex items-center">
                                                <CalendarOutlined className="text-green-500 mr-2" />
                                                <span className="font-medium text-gray-700">{councilService.formatDate(selectedCouncil.date)}</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card>                        {/* Council Members */}
                        <Card 
                            size="small" 
                            className="border-0 shadow-md rounded-lg bg-gradient-to-br from-orange-50 to-red-50"
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-orange-700">
                                        <TeamOutlined className="mr-2" />
                                        <span className="font-semibold">Thành viên hội đồng ({selectedCouncil.councilMembers.length} người)</span>
                                    </div>
                                </div>
                            }
                        >
                            <div className="bg-white rounded-lg shadow-sm">
                                <ul className="divide-y divide-gray-100">
                                    {selectedCouncil.councilMembers.map((member, index) => (
                                        <li key={member.id} className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-medium"
                                                             style={{
                                                                 backgroundColor: 
                                                                     member.role === 'CHAIRMAN' ? '#f59e0b' :
                                                                     member.role === 'SECRETARY' ? '#3b82f6' : '#6b7280'
                                                             }}>
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {member.fullName}
                                                            </p>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                member.role === 'CHAIRMAN' 
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : member.role === 'SECRETARY'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {councilService.getRoleDisplay(member.role)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            <p className="text-xs text-gray-500 truncate">
                                                                📧 {member.email}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                📞 {member.phoneNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button 
                                onClick={() => setIsDetailModalVisible(false)}
                                className="rounded-lg px-6"
                            >
                                Đóng
                            </Button>
                            <Button 
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setIsDetailModalVisible(false);
                                    handleEdit(selectedCouncil.id);
                                }}
                                className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 border-none px-6"
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