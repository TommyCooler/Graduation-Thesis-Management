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
    Empty,
    message,
    Divider,
    Badge,
    Select,
    Space,
    Tooltip,
    Modal,
    Descriptions,
    List
} from 'antd';
import {
    TeamOutlined,
    CalendarOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    LinkOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    TableOutlined
} from '@ant-design/icons';
import { MyCouncilItem, GroupedByDate } from '../../types/council';
import { councilService } from '../../services/councilService';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import dayjs from 'dayjs';
import { Calendar, dayjsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CustomToolbar from '../../components/CustomToolbar';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const localizer = dayjsLocalizer(dayjs);

const MyCouncilPage: React.FC = () => {
    const router = useRouter();
    const [councilItems, setCouncilItems] = useState<MyCouncilItem[]>([]);
    const [groupedByDate, setGroupedByDate] = useState<GroupedByDate[]>([]);
    const [filteredGroupedByDate, setFilteredGroupedByDate] = useState<GroupedByDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [semesterFilter, setSemesterFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [messageApi, contextHolder] = message.useMessage();
    
    // Calendar states
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<View>('month');
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCouncilDetail, setSelectedCouncilDetail] = useState<{
        defenseDate: string;
        councils: GroupedByDate['councils'];
    } | null>(null);

    // Hàm tạo dữ liệu mẫu để test UI
    const generateMockData = (): MyCouncilItem[] => {
        const mockData: MyCouncilItem[] = [];
        const roles = ['CHAIRMAN', 'SECRETARY', 'MEMBER'];
        const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'RETAKING'];
        const semesters = ['Học kỳ FALL2025', 'Học kỳ SPRING2026', 'Học kỳ SUMMER2026'];
        // Tạo nhiều ngày khác nhau, mỗi ngày là 1 hội đồng
        const dates = [
            '2026-01-15', '2026-01-22', '2026-01-28', '2026-02-05', '2026-02-12', 
            '2026-02-20', '2026-03-01', '2026-03-10', '2026-03-18', '2026-03-25',
            '2026-04-05', '2026-04-12', '2026-04-20', '2026-05-01', '2026-05-10',
            '2026-05-20', '2026-06-01', '2026-06-12', '2026-06-20', '2026-06-28'
        ];
        const times = ['08:00:00', '09:30:00', '11:00:00', '13:30:00', '15:00:00', '16:30:00'];
        
        let councilIdCounter = 1;
        let topicIdCounter = 1;

        // Mỗi ngày = 1 hội đồng, mỗi hội đồng có 6 đề tài
        dates.forEach((date, dateIdx) => {
            const councilId = councilIdCounter++;
            const role = roles[dateIdx % roles.length];
            const status = statuses[dateIdx % statuses.length];
            const semester = semesters[dateIdx % semesters.length];
            const councilName = `Hội Đồng Chấm ngày ${date}`;
            
            // Mỗi hội đồng có đúng 6 đề tài
            const topicsCount = 6;
            
            for (let t = 0; t < topicsCount; t++) {
                const topicId = topicIdCounter++;
                const topicTitle = `Đề tài ${topicId}: Nghiên cứu và phát triển hệ thống ${t === 0 ? 'quản lý' : t === 1 ? 'phân tích' : t === 2 ? 'tối ưu hóa' : t === 3 ? 'tự động hóa' : t === 4 ? 'giám sát' : 'báo cáo'} ${dateIdx % 3 === 0 ? 'dữ liệu lớn' : dateIdx % 3 === 1 ? 'trí tuệ nhân tạo' : 'blockchain'} cho ${t === 0 ? 'doanh nghiệp' : t === 1 ? 'tổ chức giáo dục' : t === 2 ? 'bệnh viện' : t === 3 ? 'ngân hàng' : t === 4 ? 'siêu thị' : 'nhà máy'}`;
                
                const topicStatuses = ['ASSIGNED_TO_COUNCIL', 'PENDING', 'APPROVED', 'UNDER_REVIEW'];
                mockData.push({
                    councilId,
                    topicId,
                    role,
                    councilName,
                    semester,
                    defenseDate: date,
                    status,
                    topicStatus: topicStatuses[t % topicStatuses.length],
                    topicsTitle: topicTitle,
                    topicsDescription: `Mô tả chi tiết về đề tài ${topicId}: ${topicTitle}`,
                    fileUrl: `https://example.com/files/topic-${topicId}.pdf`,
                    defenseTime: times[t % times.length]
                });
            }
        });

        return mockData;
    };

    const loadMockData = () => {
        setLoading(true);
        setTimeout(() => {
            const mockData = generateMockData();
            setCouncilItems(mockData);
            const grouped = groupByDate(mockData);
            setGroupedByDate(grouped);
            setFilteredGroupedByDate(grouped);
            setLoading(false);
            messageApi.success(`Đã tải ${mockData.length} dữ liệu mẫu`);
        }, 500);
    };

    useEffect(() => {
        fetchMyCouncils();
    }, []);

    const fetchMyCouncils = async () => {
        setLoading(true);
        try {
            const data = await councilService.getMyCouncils();
            setCouncilItems(data || []);
            
            // Gom nhóm theo ngày (defenseDate)
            const grouped = groupByDate(data || []);
            setGroupedByDate(grouped);
            setFilteredGroupedByDate(grouped);
            
            // Chỉ hiển thị error nếu có lỗi thực sự (không phải do không có dữ liệu)
            // Nếu data là mảng rỗng, đó là trường hợp bình thường (chưa được phân công)
        } catch (error: any) {
            console.error('Error fetching my councils:', error);
            // Chỉ hiển thị error nếu là lỗi thực sự (network, 500, etc.)
            // Không hiển thị error nếu chỉ là không có dữ liệu
            const errorMessage = error?.message || '';
            const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
            const isServerError = errorMessage.includes('500') || errorMessage.includes('Internal Server Error');
            
            if (isNetworkError || isServerError || error?.response?.status >= 500) {
                messageApi.error('Không thể tải danh sách hội đồng');
            }
            // Nếu không có dữ liệu (404 hoặc empty), không hiển thị error
            setCouncilItems([]);
            setGroupedByDate([]);
            setFilteredGroupedByDate([]);
        } finally {
            setLoading(false);
        }
    };

    const groupByDate = (items: MyCouncilItem[]): GroupedByDate[] => {
        // Bước 1: Gom nhóm theo councilName và defenseDate
        const councilMap = new Map<string, {
            councilName: string;
            councilId?: number;
            semester: string;
            defenseDate: string;
            status: string;
            role: string;
            retakeDate?: string | null;
            topics: {
                topicId?: number;
                title: string;
                description: string;
                fileUrl: string;
                defenseTime: string;
                topicStatus?: string;
                councilMemberId?: number;
            }[];
        }>();

        items.forEach((item) => {
            // Use councilId in key to ensure each council is grouped separately
            // This ensures each council (with different councilMemberId) is in its own card
            const councilId = (item as any)?.councilId ?? (item as any)?.councilID;
            const key = councilId 
                ? `${councilId}_${item.councilName}_${item.defenseDate}` 
                : `${item.councilName}_${item.defenseDate}`;
            
            if (!councilMap.has(key)) {
                councilMap.set(key, {
                    councilName: item.councilName,
                    councilId: councilId,
                    semester: item.semester,
                    defenseDate: item.defenseDate,
                    status: item.status,
                    role: item.role,
                    retakeDate: (item as any)?.retakeDate ?? null,
                    topics: []
                });
            }

            const council = councilMap.get(key)!;
            council.topics.push({
                topicId: (item as any)?.topicId ?? (item as any)?.topicID ?? undefined,
                title: item.topicsTitle,
                description: item.topicsDescription,
                fileUrl: item.fileUrl,
                defenseTime: item.defenseTime,
                topicStatus: (item as any)?.topicStatus ?? undefined,
                councilMemberId: (item as any)?.councilMemberId ?? undefined
            });
        });

        // Sắp xếp topics trong mỗi council theo defenseTime
        councilMap.forEach((council) => {
            council.topics.sort((a, b) => a.defenseTime.localeCompare(b.defenseTime));
        });

        // Bước 2: Gom nhóm councils theo defenseDate
        const dateMap = new Map<string, GroupedByDate>();

        councilMap.forEach((council) => {
            if (!dateMap.has(council.defenseDate)) {
                dateMap.set(council.defenseDate, {
                    defenseDate: council.defenseDate,
                    councils: []
                });
            }

            const dateGroup = dateMap.get(council.defenseDate)!;
            dateGroup.councils.push(council);
        });

        // Sắp xếp theo defenseDate (sớm nhất trước - để xem lịch dễ hơn)
        return Array.from(dateMap.values()).sort((a, b) => {
            return a.defenseDate.localeCompare(b.defenseDate);
        });
    };

    // Filter theo học kỳ và trạng thái
    useEffect(() => {
        let filtered = groupedByDate;

        // Filter theo học kỳ
        if (semesterFilter) {
            filtered = filtered.map(dateGroup => ({
                ...dateGroup,
                councils: dateGroup.councils.filter(council => council.semester === semesterFilter)
            })).filter(dateGroup => dateGroup.councils.length > 0);
        }

        // Filter theo trạng thái
        if (statusFilter) {
            filtered = filtered.map(dateGroup => ({
                ...dateGroup,
                councils: dateGroup.councils.filter(council => council.status === statusFilter)
            })).filter(dateGroup => dateGroup.councils.length > 0);
        }

        setFilteredGroupedByDate(filtered);
    }, [semesterFilter, statusFilter, groupedByDate]);

    // Lấy danh sách học kỳ unique
    const getUniqueSemesters = (): string[] => {
        const semesters = new Set<string>();
        groupedByDate.forEach(dateGroup => {
            dateGroup.councils.forEach(council => {
                semesters.add(council.semester);
            });
        });
        return Array.from(semesters).sort();
    };

    // Lấy danh sách trạng thái unique
    const getUniqueStatuses = (): string[] => {
        const statuses = new Set<string>();
        groupedByDate.forEach(dateGroup => {
            dateGroup.councils.forEach(council => {
                statuses.add(council.status);
            });
        });
        return Array.from(statuses).sort();
    };

    // Convert councils to calendar events
    const getCalendarEvents = () => {
        return filteredGroupedByDate
            .filter((dateGroup) => dateGroup.defenseDate)
            .flatMap((dateGroup) => {
                return dateGroup.councils.map((council) => {
                    const topicCount = council.topics.length;
                    return {
                        id: `${council.councilName}_${dateGroup.defenseDate}`,
                        title: `${council.councilName} (${topicCount} đề tài)`,
                        start: dayjs(dateGroup.defenseDate).startOf('day').toDate(),
                        end: dayjs(dateGroup.defenseDate).endOf('day').toDate(),
                        allDay: true,
                        resource: {
                            defenseDate: dateGroup.defenseDate,
                            councils: [council],
                            council: council,
                            topicCount: topicCount
                        }
                    };
                });
            });
    };

    // Event style getter - tùy chỉnh màu sắc dựa trên status và role
    const eventStyleGetter = (event: any) => {
        const council = event.resource?.council;
        if (!council) {
            return {
                style: {
                    backgroundColor: '#ff6b35',
                    borderColor: '#ff6b35',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    padding: '2px 4px',
                    fontSize: '12px',
                }
            };
        }

        // Màu dựa trên status
        let backgroundColor = '#ff6b35'; // default orange
        let borderColor = '#ff6b35';
        
        if (council.status === 'PLANNED') {
            backgroundColor = '#1890ff'; // blue
            borderColor = '#1890ff';
        } else if (council.status === 'COMPLETED' || council.status === 'FINISHED') {
            backgroundColor = '#52c41a'; // green
            borderColor = '#52c41a';
        } else if (council.status === 'CANCELLED') {
            backgroundColor = '#ff4d4f'; // red
            borderColor = '#ff4d4f';
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                color: 'white',
                borderRadius: '6px',
                border: `2px solid ${borderColor}`,
                padding: '4px 6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
            }
        };
    };

    // Custom event component for calendar
    const CustomEvent = ({ event }: { event: any }) => {
        const council = event.resource?.council;
        const topicCount = event.resource?.topicCount || 0;
        
        return (
            <Tooltip 
                title={
                    <div style={{ padding: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{event.title}</div>
                        {council && (
                            <>
                                <div>Vai trò: {councilService.getRoleDisplay(council.role)}</div>
                                <div>Trạng thái: {councilService.getStatusDisplay(council.status)}</div>
                                <div>Học kỳ: {council.semester}</div>
                                <div>Số đề tài: {topicCount}</div>
                            </>
                        )}
                    </div>
                }
                placement="top"
            >
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6,
                        height: '100%',
                        width: '100%',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                    }}
                >
                    <TeamOutlined style={{ fontSize: 14, flexShrink: 0 }} />
                    <span 
                        style={{ 
                            fontSize: '11px', 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                    >
                        {council?.councilName || event.title}
                    </span>
                    {topicCount > 0 && (
                        <Badge 
                            count={topicCount} 
                            style={{ 
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                fontSize: '10px',
                                minWidth: '18px',
                                height: '18px',
                                lineHeight: '18px',
                                padding: '0 4px'
                            }} 
                        />
                    )}
                </div>
            </Tooltip>
        );
    };

    // Handle calendar event click
    const handleCalendarEventClick = (event: any) => {
        const defenseDate = event.resource?.defenseDate;
        if (defenseDate) {
            // Tìm tất cả các council trong ngày đó
            const dateGroup = filteredGroupedByDate.find(
                (group) => group.defenseDate === defenseDate
            );
            if (dateGroup) {
                setSelectedCouncilDetail({
                    defenseDate: dateGroup.defenseDate,
                    councils: dateGroup.councils
                });
                setIsDetailModalVisible(true);
            }
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Hàm hiển thị trạng thái đề tài
    const getTopicStatusDisplay = (status?: string): string => {
        if (!status) return 'Chưa có trạng thái';
        const statusMap: Record<string, string> = {
            'ASSIGNED_TO_COUNCIL': 'Đã gán hội đồng',
            'PENDING': 'Chờ xử lý',
            'APPROVED': 'Đã duyệt',
            'REJECTED': 'Từ chối',
            'DRAFT': 'Nháp',
            'SUBMITTED': 'Đã nộp',
            'UNDER_REVIEW': 'Đang xem xét',
            'REVISION_REQUIRED': 'Yêu cầu sửa đổi',
        };
        return statusMap[status] || status;
    };

    // Hàm lấy màu cho trạng thái đề tài
    const getTopicStatusColor = (status?: string): string => {
        if (!status) return 'default';
        const colorMap: Record<string, string> = {
            'ASSIGNED_TO_COUNCIL': 'blue',
            'PENDING': 'cyan',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'DRAFT': 'default',
            'SUBMITTED': 'blue',
            'UNDER_REVIEW': 'orange',
            'REVISION_REQUIRED': 'yellow',
        };
        return colorMap[status] || 'default';
    };

    return (
        <Layout className="min-h-screen">
            {contextHolder}
            <Header />

            <Content className="p-10 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                            <div>
                                <Title level={2} className="text-orange-500 mb-2">
                                    <TeamOutlined /> Hội đồng của tôi
                                </Title>
                                <Paragraph className="text-base text-gray-600">
                                    Danh sách các hội đồng bạn tham gia với vai trò chấm thi
                                </Paragraph>
                            </div>
                            <Space>
                                <Button
                                    type="default"
                                    icon={<ReloadOutlined />}
                                    onClick={fetchMyCouncils}
                                    loading={loading}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    type="dashed"
                                    onClick={loadMockData}
                                    loading={loading}
                                >
                                    📊 Load Dữ liệu Mẫu
                                </Button>
                            </Space>
                        </div>

                        {/* Filter Section */}
                        {groupedByDate.length > 0 && (
                            <Card className="mb-4 shadow-sm" bodyStyle={{ padding: '12px' }}>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Text strong className="text-sm">Học kỳ:</Text>
                                            <Select
                                                placeholder="Tất cả học kỳ"
                                                value={semesterFilter}
                                                onChange={setSemesterFilter}
                                                allowClear
                                                style={{ width: 200 }}
                                                size="middle"
                                            >
                                                {getUniqueSemesters().map((semester) => (
                                                    <Option key={semester} value={semester}>
                                                        {semester}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Text strong className="text-sm">Trạng thái:</Text>
                                            <Select
                                                placeholder="Tất cả trạng thái"
                                                value={statusFilter}
                                                onChange={setStatusFilter}
                                                allowClear
                                                style={{ width: 200 }}
                                                size="middle"
                                            >
                                                {getUniqueStatuses().map((status) => (
                                                    <Option key={status} value={status}>
                                                        {councilService.getStatusDisplay(status)}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        {(semesterFilter || statusFilter) && (
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setSemesterFilter('');
                                                    setStatusFilter('');
                                                }}
                                            >
                                                Xóa bộ lọc
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {/* View Mode Toggle */}
                                    <Space>
                                        <Button
                                            type={viewMode === 'table' ? 'primary' : 'default'}
                                            icon={<TableOutlined />}
                                            onClick={() => setViewMode('table')}
                                        >
                                            Chế độ bảng
                                        </Button>
                                        <Button
                                            type={viewMode === 'calendar' ? 'primary' : 'default'}
                                            icon={<CalendarOutlined />}
                                            onClick={() => setViewMode('calendar')}
                                        >
                                            Chế độ lịch
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Content View */}
                    <Spin spinning={loading} tip="Đang tải dữ liệu...">
                        {filteredGroupedByDate.length === 0 && !loading ? (
                            <Empty
                                description={groupedByDate.length === 0 ? "Bạn chưa tham gia hội đồng nào" : "Không có hội đồng nào phù hợp với bộ lọc"}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : viewMode === 'table' ? (
                            // Table/Grid View
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {filteredGroupedByDate.map((dateGroup) => (
                                    <Card
                                        key={dateGroup.defenseDate}
                                        className="shadow-md h-full flex flex-col"
                                        bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}
                                    >
                                        {/* Date Header */}
                                        <div className="mb-3 pb-2 border-b-2 border-orange-200 flex-shrink-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CalendarOutlined className="text-orange-500 text-lg" />
                                                <Title level={4} className="!mb-0 !text-orange-600">
                                                    {formatDate(dateGroup.defenseDate)}
                                                </Title>
                                                {/* Show retakeDate if not null - kế bên ngày chấm */}
                                                {dateGroup.councils.some(c => c.retakeDate) && (
                                                    <>
                                                        <Text type="secondary" className="!text-orange-500">•</Text>
                                                        <CalendarOutlined className="text-red-500 text-lg" />
                                                        <Text strong className="!text-red-600">
                                                            Chấm lại: {formatDate(dateGroup.councils.find(c => c.retakeDate)?.retakeDate || '')}
                                                        </Text>
                                                    </>
                                                )}
                                                <Badge 
                                                    count={dateGroup.councils.reduce((sum, c) => sum + c.topics.length, 0)} 
                                                    showZero 
                                                    className="ml-2"
                                                    style={{ backgroundColor: '#ff6b35' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Content - hiển thị đầy đủ, không scroll nội bộ */}
                                        <div className="flex-1 space-y-2.5">
                                            {dateGroup.councils.map((council, councilIndex) => (
                                                <div key={councilIndex} className="border-l-3 border-l-blue-400 pl-3">
                                                    {/* Council Info */}
                                                    <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Text strong className="text-sm text-gray-900" title={council.councilName}>
                                                                {council.councilName}
                                                            </Text>
                                                            {/* Show retakeDate if not null */}
                                                            {council.retakeDate && (
                                                                <>
                                                                    <Text type="secondary" className="!text-red-500">•</Text>
                                                                    <CalendarOutlined className="text-red-500 text-sm" />
                                                                    <Text strong className="!text-red-600 text-sm">
                                                                        Chấm lại: {formatDate(council.retakeDate)}
                                                                    </Text>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Tag color={councilService.getRoleColor(council.role)} className="text-xs px-2 py-0.5">
                                                                {councilService.getRoleDisplay(council.role)}
                                                            </Tag>
                                                            <Tag color={councilService.getStatusColor(council.status)} className="text-xs px-2 py-0.5">
                                                                {councilService.getStatusDisplay(council.status)}
                                                            </Tag>
                                                            <Tag color="orange" className="text-xs px-2 py-0.5">{council.semester}</Tag>
                                                            {council.role === 'CHAIRMAN' && (
                                                                <>
                                                                    {council.status === 'PLANNED' && (
                                                                        <Button
                                                                            size="small"
                                                                            type="primary"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    let resolvedCouncilId = (council as any)?.councilId;
                                                                                    if (!resolvedCouncilId) {
                                                                                        const match = councilItems.find(it => 
                                                                                            it.councilName === council.councilName &&
                                                                                            it.defenseDate === dateGroup.defenseDate &&
                                                                                            it.semester === council.semester &&
                                                                                            (it as any)?.councilId
                                                                                        ) as any;
                                                                                        resolvedCouncilId = match?.councilId;
                                                                                    }
                                                                                    if (!resolvedCouncilId) {
                                                                                        messageApi.warning('Không có ID hội đồng từ API để cập nhật.');
                                                                                        return;
                                                                                    }
                                                                                    await councilService.updateCouncilStatus(Number(resolvedCouncilId), 'IN_PROGRESS');
                                                                                    messageApi.success('Đã bắt đầu chấm hội đồng');
                                                                                    fetchMyCouncils();
                                                                                } catch (err: any) {
                                                                                    messageApi.error(err.message || 'Cập nhật trạng thái thất bại');
                                                                                }
                                                                            }}
                                                                        >
                                                                            Bắt đầu chấm
                                                                        </Button>
                                                                    )}
                                                                    {(council.status === 'IN_PROGRESS' || council.status === 'RETAKING') && (
                                                                        <Button
                                                                            size="small"
                                                                            type="primary"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    let resolvedCouncilId = (council as any)?.councilId;
                                                                                    if (!resolvedCouncilId) {
                                                                                        const match = councilItems.find(it => 
                                                                                            it.councilName === council.councilName &&
                                                                                            it.defenseDate === dateGroup.defenseDate &&
                                                                                            it.semester === council.semester &&
                                                                                            (it as any)?.councilId
                                                                                        ) as any;
                                                                                        resolvedCouncilId = match?.councilId;
                                                                                    }
                                                                                    if (!resolvedCouncilId) {
                                                                                        messageApi.warning('Không có ID hội đồng từ API để cập nhật.');
                                                                                        return;
                                                                                    }
                                                                                    await councilService.updateCouncilStatus(Number(resolvedCouncilId), 'COMPLETED');
                                                                                    messageApi.success('Đã hoàn thành hội đồng');
                                                                                    fetchMyCouncils();
                                                                                } catch (err: any) {
                                                                                    messageApi.error(err.message || 'Cập nhật trạng thái thất bại');
                                                                                }
                                                                            }}
                                                                        >
                                                                            Hoàn thành
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Topics List */}
                                                    <div className="space-y-2">
                                                        {council.topics.map((topic, topicIndex) => (
                                                            <div
                                                                key={topicIndex}
                                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-orange-50 transition-colors border-l-2 border-orange-400 cursor-pointer"
                                                                onClick={() => {
                                                                    const tId = (topic as any)?.topicId;
                                                                    const cMemberId = (topic as any)?.councilMemberId;
                                                                    const role = council.role; // Lấy role từ council
                                                                    if (tId) {
                                                                        const params = new URLSearchParams();
                                                                        if (cMemberId) {
                                                                            params.append('councilMemberId', cMemberId.toString());
                                                                        }
                                                                        if (role) {
                                                                            params.append('role', role);
                                                                        }
                                                                        router.push(`/my-council/topic/${tId}?${params.toString()}`);
                                                                    } else {
                                                                        const params = new URLSearchParams({
                                                                            title: topic.title || '',
                                                                            description: topic.description || '',
                                                                            fileUrl: topic.fileUrl || '',
                                                                            defenseTime: topic.defenseTime || '',
                                                                            defenseDate: dateGroup.defenseDate || '',
                                                                            councilName: council.councilName || '',
                                                                            semester: council.semester || ''
                                                                        });
                                                                        if (cMemberId) {
                                                                            params.append('councilMemberId', cMemberId.toString());
                                                                        }
                                                                        if (role) {
                                                                            params.append('role', role);
                                                                        }
                                                                        router.push(`/my-council/topic?${params.toString()}`);
                                                                    }
                                                                }}
                                                            >
                                                                {/* Time - Fixed width */}
                                                                <div className="flex items-center gap-1.5 min-w-[72px] flex-shrink-0">
                                                                    <FieldTimeOutlined className="text-orange-500 text-base" />
                                                                    <Text strong className="text-base text-orange-600">
                                                                        {topic.defenseTime.substring(0, 5)}
                                                                    </Text>
                                                                </div>

                                                                {/* Topic Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="w-6 h-6 bg-orange-500 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                            {topicIndex + 1}
                                                                        </span>
                                                                        <Text strong className="text-base" title={topic.title}>
                                                                            {topic.title}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                {/* Topic Status */}
                                                                {(topic as any)?.topicStatus && (
                                                                    <Tag 
                                                                        color={getTopicStatusColor((topic as any)?.topicStatus)} 
                                                                        className="flex-shrink-0 text-xs"
                                                                    >
                                                                        {getTopicStatusDisplay((topic as any)?.topicStatus)}
                                                                    </Tag>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            // Calendar View
                            <Card className="shadow-md" bodyStyle={{ padding: '20px' }}>
                                {getCalendarEvents().length === 0 ? (
                                    <Empty
                                        description="Không có hội đồng nào trong khoảng thời gian này"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        style={{ padding: '40px 0' }}
                                    />
                                ) : (
                                    <>
                                        {/* Summary Stats */}
                                        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                                                        <Text>Đã lập</Text>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded bg-green-500"></div>
                                                        <Text>Hoàn thành</Text>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                                                        <Text>Khác</Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ 
                                            height: 'calc(100vh - 450px)',
                                            minHeight: '600px',
                                            maxHeight: '800px'
                                        }}>
                                            <Calendar
                                                localizer={localizer}
                                                events={getCalendarEvents()}
                                                startAccessor="start"
                                                endAccessor="end"
                                                style={{ height: '100%' }}
                                                views={['month', 'week', 'day']}
                                                date={calendarDate}
                                                view={calendarView}
                                                onNavigate={setCalendarDate}
                                                onView={setCalendarView}
                                                defaultView="month"
                                                components={{
                                                    toolbar: CustomToolbar,
                                                    event: CustomEvent,
                                                }}
                                                eventPropGetter={eventStyleGetter}
                                                onSelectEvent={handleCalendarEventClick}
                                                popup
                                                popupOffset={{ x: 10, y: 10 }}
                                            />
                                        </div>
                                    </>
                                )}
                            </Card>
                        )}
                    </Spin>
                </div>
            </Content>

            <Footer />

            {/* Modal chi tiết hội đồng từ calendar */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <CalendarOutlined className="text-orange-500 text-xl" />
                        <div>
                            <div className="text-lg font-semibold">
                                Chi tiết hội đồng - {selectedCouncilDetail ? formatDate(selectedCouncilDetail.defenseDate) : ''}
                            </div>
                            {selectedCouncilDetail && (
                                <div className="text-sm text-gray-500 font-normal">
                                    {selectedCouncilDetail.councils.length} hội đồng • {' '}
                                    {selectedCouncilDetail.councils.reduce((sum, c) => sum + c.topics.length, 0)} đề tài
                                </div>
                            )}
                        </div>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={1000}
                style={{ top: 20 }}
                bodyStyle={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '20px' }}
            >
                {selectedCouncilDetail && (
                    <div className="space-y-4">
                        {selectedCouncilDetail.councils.map((council, councilIndex) => (
                            <Card
                                key={councilIndex}
                                className="mb-4 shadow-sm hover:shadow-md transition-shadow"
                                title={
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <TeamOutlined className="text-orange-500" />
                                        <Text strong className="text-base">{council.councilName}</Text>
                                        <Tag color={councilService.getRoleColor(council.role)} className="font-medium">
                                            {councilService.getRoleDisplay(council.role)}
                                        </Tag>
                                        <Tag color={councilService.getStatusColor(council.status)} className="font-medium">
                                            {councilService.getStatusDisplay(council.status)}
                                        </Tag>
                                        <Tag color="orange" className="font-medium">{council.semester}</Tag>
                                    </div>
                                }
                                extra={
                                    <Badge 
                                        count={council.topics.length} 
                                        style={{ backgroundColor: '#ff6b35' }}
                                        showZero
                                    />
                                }
                            >
                                <Descriptions bordered column={2} size="small" className="mb-4">
                                    <Descriptions.Item label="Ngày chấm" span={1}>
                                        <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-orange-500" />
                                            <Text strong>{formatDate(selectedCouncilDetail.defenseDate)}</Text>
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số đề tài" span={1}>
                                        <Text strong className="text-orange-600">{council.topics.length} đề tài</Text>
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider orientation="left" style={{ marginTop: '16px', marginBottom: '12px' }}>
                                    <div className="flex items-center gap-2">
                                        <FileTextOutlined className="text-orange-500" />
                                        <span>Danh sách đề tài ({council.topics.length})</span>
                                    </div>
                                </Divider>
                                
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                                    {council.topics.map((topic, topicIndex) => (
                                        <Card
                                            key={topicIndex}
                                            size="small"
                                            className="hover:bg-orange-50 transition-colors border-l-4 border-l-orange-400"
                                            bodyStyle={{ padding: '12px' }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {topicIndex + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <Text strong className="text-sm flex-1 min-w-0">
                                                            {topic.title}
                                                        </Text>
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded">
                                                            <FieldTimeOutlined className="text-orange-600 text-xs" />
                                                            <Text className="text-xs text-orange-700 font-semibold">
                                                                {topic.defenseTime.substring(0, 5)}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    {topic.description && (
                                                        <Text className="text-xs text-gray-600 block mt-1 line-clamp-2">
                                                            {topic.description}
                                                        </Text>
                                                    )}
                                                    {topic.fileUrl && (
                                                        <div className="mt-2">
                                                            <Button
                                                                type="link"
                                                                icon={<LinkOutlined />}
                                                                href={topic.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-orange-600 hover:text-orange-700 p-0 h-auto"
                                                                size="small"
                                                            >
                                                                Xem file đề tài
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal>

        </Layout>
    );
};

export default MyCouncilPage;

