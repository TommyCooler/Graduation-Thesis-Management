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

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const localizer = dayjsLocalizer(dayjs);

const MyCouncilPage: React.FC = () => {
    const [councilItems, setCouncilItems] = useState<MyCouncilItem[]>([]);
    const [groupedByDate, setGroupedByDate] = useState<GroupedByDate[]>([]);
    const [filteredGroupedByDate, setFilteredGroupedByDate] = useState<GroupedByDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [semesterFilter, setSemesterFilter] = useState<string>('');
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

    useEffect(() => {
        fetchMyCouncils();
    }, []);

    const fetchMyCouncils = async () => {
        setLoading(true);
        try {
            const data = await councilService.getMyCouncils();
            setCouncilItems(data);
            
            // Gom nhóm theo ngày (defenseDate)
            const grouped = groupByDate(data);
            setGroupedByDate(grouped);
            setFilteredGroupedByDate(grouped);
        } catch (error) {
            console.error('Error fetching my councils:', error);
            messageApi.error('Không thể tải danh sách hội đồng');
        } finally {
            setLoading(false);
        }
    };

    const groupByDate = (items: MyCouncilItem[]): GroupedByDate[] => {
        // Bước 1: Gom nhóm theo councilName và defenseDate
        const councilMap = new Map<string, {
            councilName: string;
            semester: string;
            defenseDate: string;
            status: string;
            role: string;
            topics: {
                title: string;
                description: string;
                fileUrl: string;
                defenseTime: string;
            }[];
        }>();

        items.forEach((item) => {
            const key = `${item.councilName}_${item.defenseDate}`;
            
            if (!councilMap.has(key)) {
                councilMap.set(key, {
                    councilName: item.councilName,
                    semester: item.semester,
                    defenseDate: item.defenseDate,
                    status: item.status,
                    role: item.role,
                    topics: []
                });
            }

            const council = councilMap.get(key)!;
            council.topics.push({
                title: item.topicsTitle,
                description: item.topicsDescription,
                fileUrl: item.fileUrl,
                defenseTime: item.defenseTime
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

    // Filter theo học kỳ
    useEffect(() => {
        if (!semesterFilter) {
            setFilteredGroupedByDate(groupedByDate);
            return;
        }

        const filtered = groupedByDate.map(dateGroup => ({
            ...dateGroup,
            councils: dateGroup.councils.filter(council => council.semester === semesterFilter)
        })).filter(dateGroup => dateGroup.councils.length > 0);

        setFilteredGroupedByDate(filtered);
    }, [semesterFilter, groupedByDate]);

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
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchMyCouncils}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        </div>

                        {/* Filter Section */}
                        {groupedByDate.length > 0 && (
                            <Card className="mb-4 shadow-sm" bodyStyle={{ padding: '12px' }}>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <Text strong className="text-sm">Lọc theo học kỳ:</Text>
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
                                        {semesterFilter && (
                                            <Button
                                                size="small"
                                                onClick={() => setSemesterFilter('')}
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredGroupedByDate.map((dateGroup) => (
                                    <Card
                                        key={dateGroup.defenseDate}
                                        className="shadow-md h-full flex flex-col"
                                        bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}
                                    >
                                        {/* Date Header */}
                                        <div className="mb-3 pb-2 border-b-2 border-orange-200 flex-shrink-0">
                                            <div className="flex items-center gap-2">
                                                <CalendarOutlined className="text-orange-500 text-lg" />
                                                <Title level={4} className="!mb-0 !text-orange-600">
                                                    {formatDate(dateGroup.defenseDate)}
                                                </Title>
                                                <Badge 
                                                    count={dateGroup.councils.reduce((sum, c) => sum + c.topics.length, 0)} 
                                                    showZero 
                                                    className="ml-2"
                                                    style={{ backgroundColor: '#ff6b35' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Content - Optimized height để không scroll */}
                                        <div className="flex-1 overflow-y-auto space-y-2.5" style={{ maxHeight: 'calc(100vh - 380px)', scrollbarWidth: 'thin' }}>
                                            {dateGroup.councils.map((council, councilIndex) => (
                                                <div key={councilIndex} className="border-l-3 border-l-blue-400 pl-3">
                                                    {/* Council Info */}
                                                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                                                        <Text strong className="text-sm text-gray-800 truncate" title={council.councilName}>
                                                            {council.councilName}
                                                        </Text>
                                                        <Tag color={councilService.getRoleColor(council.role)} className="text-xs px-2 py-0.5">
                                                            {councilService.getRoleDisplay(council.role)}
                                                        </Tag>
                                                        <Tag color={councilService.getStatusColor(council.status)} className="text-xs px-2 py-0.5">
                                                            {councilService.getStatusDisplay(council.status)}
                                                        </Tag>
                                                        <Tag color="orange" className="text-xs px-2 py-0.5">{council.semester}</Tag>
                                                    </div>

                                                    {/* Topics List */}
                                                    <div className="space-y-1.5">
                                                        {council.topics.map((topic, topicIndex) => (
                                                            <div
                                                                key={topicIndex}
                                                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md hover:bg-orange-50 transition-colors border-l-2 border-orange-400"
                                                            >
                                                                {/* Time - Fixed width */}
                                                                <div className="flex items-center gap-1 min-w-[60px] flex-shrink-0">
                                                                    <FieldTimeOutlined className="text-orange-500 text-sm" />
                                                                    <Text strong className="text-sm text-orange-600">
                                                                        {topic.defenseTime.substring(0, 5)}
                                                                    </Text>
                                                                </div>

                                                                {/* Topic Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="w-5 h-5 bg-orange-500 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                            {topicIndex + 1}
                                                                        </span>
                                                                        <Text strong className="text-sm truncate" title={topic.title}>
                                                                            {topic.title}
                                                                        </Text>
                                                                    </div>
                                                                </div>

                                                                {/* File Link */}
                                                                {topic.fileUrl && (
                                                                    <Button
                                                                        type="link"
                                                                        icon={<LinkOutlined />}
                                                                        href={topic.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-orange-600 hover:text-orange-700 flex-shrink-0"
                                                                        size="small"
                                                                    >
                                                                        File
                                                                    </Button>
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

