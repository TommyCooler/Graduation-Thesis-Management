'use client';
import React, { useEffect, useState } from 'react';
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Card,
  Typography,
  Spin,
  Tooltip,
  List,
  Descriptions,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import reviewCouncilService, {
  ReviewCouncilUIModel,
  Lecturer,
} from '../../services/reviewCouncilService';
import { accountService, CurrentUser } from '@/services/accountService';
import topicService from '@/services/topicService';
import { ApprovedTopic } from '../../types/topic';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, dayjsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CustomToolbar from '../../components/CustomToolbar';
import { useRouter } from 'next/navigation';
import { NextRouter } from 'next/router'; // Import NextRouter

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;
const localizer = dayjsLocalizer(dayjs);

const normalizeString = (str: string | null | undefined) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// --- Helpers (Moved outside component for reusability) ---

const getMilestoneColor = (milestone: string) => {
  switch (milestone) {
    case 'WEEK 4':
      return 'orange';
    case 'WEEK 8':
      return 'cyan';
    case 'WEEK 12':
      return 'purple';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đã lập':
      return 'blue';
    case 'Hoàn thành':
      return 'green';
    case 'Đã hủy':
      return 'red';
    default:
      return 'default';
  }
};

const getResultColor = (result: string) => {
  switch (result) {
    case 'Đạt':
      return 'green';
    case 'Không đạt':
      return 'red';
    case 'Chưa có':
      return 'gray';
    default:
      return 'default';
  }
};

// --- (NEW) Reusable Council Table Component ---

interface CouncilTableProps {
  councils: ReviewCouncilUIModel[];
  loading: boolean;
  currentUser: CurrentUser | null;
  onEdit: (council: ReviewCouncilUIModel) => void;
  router: any; // Using 'any' to avoid NextRouter type conflicts, adjust if needed
}

const CouncilTable: React.FC<CouncilTableProps> = ({
  councils,
  loading,
  currentUser,
  onEdit,
  router,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!loading && councils.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <p>Không có hội đồng nào được tìm thấy.</p>
      </div>
    );
  }

  return (
    <Table
      dataSource={councils}
      rowKey="id"
      bordered
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 'max-content' }}
    >
      <Table.Column
        title="Tên hội đồng"
        dataIndex="name"
        key="name"
        align="center"
        render={(text) => <strong>{text}</strong>}
      />
      <Table.Column
        title="Mốc review"
        dataIndex="milestone"
        key="milestone"
        align="center"
        render={(milestone) => (
          <Tag color={getMilestoneColor(milestone)}>
            {milestone.replace('_', ' ')}
          </Tag>
        )}
      />
      <Table.Column
        title="Ngày review"
        dataIndex="reviewDate"
        key="reviewDate"
        align="center"
        render={(text) => (
          <span style={{ whiteSpace: 'nowrap' }}>{text || <i>Chưa có</i>}</span>
        )}
      />
      <Table.Column
        title="Link meeting / Số phòng"
        key="meetingOrRoom"
        align="center"
        render={(_, record: ReviewCouncilUIModel) => {
          if (record.meetingLink) {
            return (
              <a
                href={record.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                // style={{ color: '#1677ff', textDecoration: 'underline' }}
              >
                Link
              </a>
            );
          } else if (record.roomNumber) {
            return <span>{record.roomNumber}</span>;
          } else {
            return <i>Chưa có thông tin</i>;
          }
        }}
      />
      <Table.Column
        title="Trạng thái"
        dataIndex="status"
        key="status"
        align="center"
        render={(status) => (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        )}
        filters={[
          { text: 'Đã lập', value: 'Đã lập' },
          { text: 'Hoàn thành', value: 'Hoàn thành' },
          { text: 'Đã hủy', value: 'Đã hủy' },
        ]}
        onFilter={(value, record) => record.status === value}
      />
      <Table.Column
        title="Kết quả"
        dataIndex="result"
        key="result"
        align="center"
        render={(result) => (
          <Tag color={getResultColor(result)}>{result}</Tag>
        )}
      />
      <Table.Column
        title="Giảng viên 1"
        key="lecturer1"
        align="center"
        render={(_, record: ReviewCouncilUIModel) =>
          record.lecturers[0] ? (
            <Tag color="purple" style={{ fontWeight: 600, fontSize: '13px' }}>
              {record.lecturers[0].accountName}
            </Tag>
          ) : (
            <i>Chưa có</i>
          )
        }
      />
      <Table.Column
        title="Giảng viên 2"
        key="lecturer2"
        align="center"
        render={(_, record: ReviewCouncilUIModel) =>
          record.lecturers[1] ? (
            <Tag color="magenta" style={{ fontWeight: 600, fontSize: '13px' }}>
              {record.lecturers[1].accountName}
            </Tag>
          ) : (
            <i>Chưa có</i>
          )
        }
      />
      <Table.Column
        title="Hành động"
        key="actions"
        align="center"
        width={120}
        render={(_, record: ReviewCouncilUIModel) => (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Tooltip title="Xem chi tiết hội đồng">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                onClick={() => router.push(`/review-council/grade?id=${record.id}`)}
              />
            </Tooltip>
            {currentUser?.role === 'HEADOFDEPARTMENT' && (
              <Tooltip
                title={
                  record.status !== 'Đã lập'
                    ? 'Chỉ có thể sửa khi "Đã lập"'
                    : 'Sửa hội đồng'
                }
              >
                <Button
                  type="text"
                  icon={
                    <EditOutlined
                      style={{
                        color: record.status !== 'Đã lập' ? 'gray' : 'orange',
                      }}
                    />
                  }
                  onClick={() => onEdit(record)}
                  disabled={record.status !== 'Đã lập'}
                />
              </Tooltip>
            )}
          </div>
        )}
      />
    </Table>
  );
};

// --- Main Page Component ---

export default function ReviewCouncilPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCouncil, setEditingCouncil] = useState<ReviewCouncilUIModel | null>(null);

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);

  // State for HOD (Topics)
  const [approvedTopics, setApprovedTopics] = useState<ApprovedTopic[]>([]);
  const [loadingApprovedTopics, setLoadingApprovedTopics] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // HOD's council list modal
  const [selectedTopic, setSelectedTopic] = useState<ApprovedTopic | null>(null);
  const [councils, setCouncils] = useState<ReviewCouncilUIModel[]>([]); // Councils for selected topic
  const [loadingCouncils, setLoadingCouncils] = useState(false);

  // (REMOVED) State for Lecturer
  // const [lecturerCouncils, setLecturerCouncils] = useState<ReviewCouncilUIModel[]>([]);
  // const [loadingLecturerCouncils, setLoadingLecturerCouncils] = useState(false);

  const [showReviewDateField, setShowReviewDateField] = useState(false);

  // state for Calendar (HOD + Lecturer)
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [allCouncils, setAllCouncils] = useState<ReviewCouncilUIModel[]>([]); // (USED BY BOTH)
  const [loadingAllCouncils, setLoadingAllCouncils] = useState(false); // (USED BY BOTH)
  const [isCouncilDetailModalVisible, setIsCouncilDetailModalVisible] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<ReviewCouncilUIModel | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>('month');

  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // (UPDATED) Combined useEffect for data fetching
  useEffect(() => {
    const fetchCurrentUserAndData = async () => {
      let user: CurrentUser | null = null;
      try {
        const response: any = await accountService.getMe();
        if (response && response.data && response.code === 200) {
          user = response.data;
          setCurrentUser(user);
        } else {
          toast.error('Không thể xác thực người dùng.');
          return; // Stop if user fetch fails
        }
      } catch (err) {
        toast.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        return; // Stop if user fetch fails
      }

      // Fetch data based on role
      if (user) {
        // (UPDATED) HOD fetches extra data
        if (user.role === 'HEADOFDEPARTMENT') {
          fetchLecturers();
          fetchApprovedTopics();
        }
        
        // (UPDATED) Both roles fetch their councils using the same function
        fetchAllCouncils(); 
      }
    };

    fetchCurrentUserAndData();
  }, []); // Empty dependency array, runs once on mount

  // (REMOVED) Fetch function for Lecturer
  // const fetchLecturerCouncils = async () => { ... }

  // --- HOD Specific Functions ---

  const fetchApprovedTopics = async () => {
    try {
      setLoadingApprovedTopics(true);
      const data = await topicService.getApprovedTopics();
      setApprovedTopics(data);
    } catch (err) {
      toast.error('Không thể tải danh sách đề tài đã được duyệt.');
      setApprovedTopics([]);
    } finally {
      setLoadingApprovedTopics(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      setLoadingLecturers(true);
      const data = await reviewCouncilService.getAllLecturers();
      setLecturers(data);
    } catch (err) {
      toast.error('Không thể tải danh sách giảng viên.');
      setLecturers([]);
    } finally {
      setLoadingLecturers(false);
    }
  };

  // (UPDATED) This function now serves BOTH roles
  const fetchAllCouncils = async () => {
    try {
      setLoadingAllCouncils(true);
      // This service call fetches data based on the user's role (handled by backend)
      const data = await reviewCouncilService.getAllCouncils(); 
      const sortedData = [...data].sort((a, b) => {
        if (!a.reviewDate) return 1;
        if (!b.reviewDate) return -1;
        return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      });
      setAllCouncils(sortedData); // This state is used by HOD's calendar AND Lecturer's table/calendar
    } catch (err) {
      toast.error('Không thể tải danh sách hội đồng');
      setAllCouncils([]);
    } finally {
      setLoadingAllCouncils(false);
    }
  };

  const handleViewCouncils = async (topic: ApprovedTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
    setLoadingCouncils(true);

    try {
      const data = await reviewCouncilService.getCouncilsByTopicID(topic.topicID);
      const sortedData = [...data].sort((a, b) => {
        if (!a.reviewDate) return 1;
        if (!b.reviewDate) return -1;
        return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      });
      setCouncils(sortedData);
    } catch (err) {
      toast.error('Không thể tải danh sách hội đồng của đề tài này.');
      setCouncils([]);
    } finally {
      setLoadingCouncils(false);
    }
  };

  const milestoneOptions = [
    { label: 'WEEK 4', value: 'WEEK_4' },
    { label: 'WEEK 8', value: 'WEEK_8' },
    { label: 'WEEK 12', value: 'WEEK_12' },
  ];

  // --- Common Handlers (mostly for HOD) ---

  const handleEditCouncil = (council: ReviewCouncilUIModel) => {
    setEditingCouncil(council);
    setIsModalOpen(false); // Close list modal
    setIsCouncilDetailModalVisible(false); // Close detail modal
    setIsModalVisible(true); // Open edit modal
    setShowReviewDateField(true);

    form.resetFields();
    setTimeout(() => {
      // Đảm bảo accountID là number để so sánh đúng với Select
      const lecturerIds = council.lecturers.map((lec) => {
        return typeof lec.accountID === 'string' 
          ? Number(lec.accountID) 
          : lec.accountID;
      });
      
      form.setFieldsValue({
        topicTitle: council.topicTitle,
        milestone: council.milestone.replace(' ', '_'),
        reviewDate: council.reviewDate ? dayjs(council.reviewDate) : undefined,
        reviewFormat: council.reviewFormat,
        meetingLink: council.meetingLink,
        roomNumber: council.roomNumber,
        lecturerAccountIds: lecturerIds,
      });
    }, 0);
  };

  const handleCreateCouncil = async () => {
    if (!selectedTopic) return;
    const existingCouncils = await reviewCouncilService.getCouncilsByTopicID(
      selectedTopic.topicID
    );
    setShowReviewDateField(existingCouncils.length === 0);
    setEditingCouncil(null);
    setIsModalVisible(true);
    form.resetFields();

    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        topicID: selectedTopic.topicID,
        topicTitle: selectedTopic.topicTitle,
        milestone: existingCouncils.length === 0 ? 'WEEK_4' : 'WEEK_8',
      });
    }, 0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCouncil(null);
  };

  const handleOk = async () => {
    // This logic assumes selectedTopic is set, which only happens for HOD
    if (!selectedTopic && !editingCouncil) {
      toast.error('Lỗi: Không tìm thấy đề tài đã chọn.');
      return;
    }

    try {
      const values = await form.validateFields();
      const reviewDateValue: dayjs.Dayjs | undefined = values.reviewDate;
      const isoDateString = reviewDateValue?.isValid()
        ? reviewDateValue.hour(12).minute(0).second(0).millisecond(0).toISOString()
        : null;

      const payloadBase = {
        reviewFormat: values.reviewFormat,
        meetingLink: values.meetingLink || null,
        roomNumber: values.roomNumber || null,
        lecturerAccountIds: values.lecturerAccountIds || [],
      };

      if (editingCouncil) {
        await reviewCouncilService.updateCouncilDetails(editingCouncil.id, {
          reviewDate: isoDateString || editingCouncil.reviewDate || null,
          ...payloadBase,
        });
        toast.success('Cập nhật hội đồng thành công!');
      } else if (selectedTopic) {
        // Only create if selectedTopic exists
        const createPayload = {
          topicID: selectedTopic.topicID,
          milestone: values.milestone,
          reviewDate: showReviewDateField && isoDateString ? isoDateString : null,
          ...payloadBase,
        };
        await reviewCouncilService.createCouncil(createPayload);
        toast.success('Tạo hội đồng thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingCouncil(null);

      // Refetch data
      if (selectedTopic) {
        await handleViewCouncils(selectedTopic); // Refresh HOD topic modal
      }
      await fetchAllCouncils(); // Refresh HOD calendar AND Lecturer list/calendar
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin hoặc xảy ra lỗi validation');
      }
    }
  };

  // --- HOD Calendar Functions ---
  // (UPDATED) This function now serves BOTH roles
  const getCalendarEvents = () => {
    return allCouncils // This state holds the correct data for either role
      .filter((council) => council.reviewDate)
      .map((council) => ({
        id: council.id,
        title: council.name,
        start: dayjs(council.reviewDate).startOf('day').toDate(),
        end: dayjs(council.reviewDate).endOf('day').toDate(),
        allDay: true,
        resource: council,
      }));
  };

  const CustomEvent = ({ event }: { event: any }) => {
    const council: ReviewCouncilUIModel | undefined = event.resource;

    return (
      <Tooltip title={event.title}>
        {council?.status === 'Hoàn thành' ? (
          // (MỚI) Icon tick xanh nếu 'Hoàn thành'
          // Dùng màu trắng để nổi bật trên nền xanh
          <CheckCircleFilled style={{ color: 'white', fontSize: 20 }} />
        ) : (
          // Icon mặc định
          <TeamOutlined style={{ color: 'white', fontSize: 20 }} />
        )}
      </Tooltip>
    );
  };

  // --- HOD Topic List Helpers ---

  const getTopicStatusColor = (topicStatus?: string): string => {
    switch (topicStatus) {
      case 'Đã duyệt':
        return 'blue';
      case 'Đạt lần 1':
      case 'Đạt lần 2':
      case 'Đạt lần 3':
        return 'green';
      case 'Không đạt':
        return 'red';
      default:
        return 'default';
    }
  };

  const topicStatusFilters = React.useMemo(() => {
    const uniqueStatuses = [
      ...new Set(approvedTopics.map((topic) => topic.topicStatus)),
    ];
    return uniqueStatuses
      .filter((status) => status)
      .map((status) => ({
        text: status,
        value: status,
      }));
  }, [approvedTopics]);

  const filteredTopics = React.useMemo(() => {
    if (!searchText) {
      return approvedTopics;
    }
    const normalizedSearch = normalizeString(searchText);
    return approvedTopics.filter((topic) =>
      normalizeString(topic.topicTitle).includes(normalizedSearch)
    );
  }, [approvedTopics, searchText]);

  // --- Main Render ---

  const renderContent = () => {
    if (!currentUser) {
      return (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 8 }}>Đang tải dữ liệu người dùng...</p>
          </div>
        </Card>
      );
    }

    // ===================================
    // == HOD VIEW
    // ===================================
    if (currentUser.role === 'HEADOFDEPARTMENT') {
      return (
        <Card>
          <Title
            level={2}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}
          >
            <CheckCircleOutlined style={{ color: 'green' }} />
            Danh sách đề tài đã được duyệt
          </Title>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Space>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                Chế độ bảng
              </Button>
              <Button
                type={viewMode === 'calendar' ? 'primary' : 'default'}
                onClick={() => setViewMode('calendar')}
              >
                Chế độ lịch
              </Button>
            </Space>

            {viewMode === 'table' && (
              <Input.Search
                placeholder="Tìm kiếm theo tên đề tài..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 400,
                  marginLeft: '16px',
                }}
              />
            )}
          </div>

          {viewMode === 'table' ? (
            // HOD: Table View (Topic List)
            <>
              {loadingApprovedTopics ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={filteredTopics}
                  rowKey="topicID"
                  bordered
                  pagination={{ pageSize: 5 }}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <Table.Column
                    title="STT"
                    key="index"
                    align="center"
                    width={80}
                    render={(_, __, index) => index + 1}
                  />
                  <Table.Column
                    title="Tên đề tài"
                    dataIndex="topicTitle"
                    key="topicTitle"
                    align="center"
                    render={(text: string) => (
                      <span style={{ fontWeight: 500 }}>{text}</span>
                    )}
                  />
                  <Table.Column
                    title="Mô tả"
                    dataIndex="description"
                    key="description"
                    align="center"
                    render={(text: string) => (
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ marginBottom: 0 }}
                      >
                        {text}
                      </Paragraph>
                    )}
                  />
                  <Table.Column
                    title="Trạng thái"
                    dataIndex="topicStatus"
                    key="topicStatus"
                    align="center"
                    filters={topicStatusFilters}
                    onFilter={(value, record) => record.topicStatus === value}
                    render={(topicStatus) => (
                      <Tag color={getTopicStatusColor(topicStatus)}>
                        {topicStatus}
                      </Tag>
                    )}
                  />
                  <Table.Column
                    title="Hội đồng"
                    key="action"
                    align="center"
                    width={130}
                    render={(_, record: ApprovedTopic) => (
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewCouncils(record)}
                      >
                        Xem
                      </Button>
                    )}
                  />
                </Table>
              )}
            </>
          ) : (
            // HOD: Calendar View
            loadingAllCouncils ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={getCalendarEvents()}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
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
                onSelectEvent={(event) => {
                  setSelectedCouncil(event.resource);
                  setIsCouncilDetailModalVisible(true);
                }}
              />
            )
          )}
        </Card>
      );
    }

    // ===================================
    // == LECTURER VIEW (UPDATED)
    // ===================================
    return (
      <Card>
        <Title
          level={2}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          <TeamOutlined style={{ color: '#1890ff' }} />
          Danh sách hội đồng của bạn
        </Title>
        
        {/* (NEW) Added ViewMode toggle for Lecturer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Space>
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
            >
              Chế độ bảng
            </Button>
            <Button
              type={viewMode === 'calendar' ? 'primary' : 'default'}
              onClick={() => setViewMode('calendar')}
            >
              Chế độ lịch
            </Button>
          </Space>
        </div>

        {/* (NEW) Added Ternary for Lecturer view */}
        {viewMode === 'table' ? (
          <CouncilTable
            councils={allCouncils} // (UPDATED) Use allCouncils
            loading={loadingAllCouncils} // (UPDATED) Use loadingAllCouncils
            currentUser={currentUser}
            onEdit={handleEditCouncil} 
            router={router}
          />
        ) : (
          // (NEW) Added Calendar view for Lecturer
          loadingAllCouncils ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={getCalendarEvents()} // Reuses the same event getter
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
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
              onSelectEvent={(event) => {
                setSelectedCouncil(event.resource);
                setIsCouncilDetailModalVisible(true);
              }}
            />
          )
        )}
      </Card>
    );
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="p-6 bg-gray-100">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </Content>
      <Footer />

      {/* --- Modals (Mostly for HOD) --- */}

      {/* Modal hiển thị hội đồng (HOD clicks 'View') */}
      <Modal
        title={
          <span>
            Hội đồng của đề tài:{' '}
            <strong>{selectedTopic?.topicTitle}</strong>
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          currentUser?.role === 'HEADOFDEPARTMENT' ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateCouncil}
            >
              Tạo hội đồng mới
            </Button>
          ) : null
        }
        width={1000}
      >
        {/* (UPDATED) Use Reusable Component */}
        <CouncilTable
          councils={councils}
          loading={loadingCouncils}
          currentUser={currentUser}
          onEdit={handleEditCouncil}
          router={router}
        />
      </Modal>

    
      {/* Modal TẠO/SỬA hội đồng (HOD only) */}
      <Modal
        title={editingCouncil ? 'Chỉnh sửa hội đồng' : 'Tạo hội đồng mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText={editingCouncil ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
        confirmLoading={loadingCouncils}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            reviewFormat: 'OFFLINE',
            status: 'Đã lập',
          }}
        >
          {/* Tên đề tài */}
          <Form.Item name="topicTitle" label="Đề tài">
            <Input
              disabled
              value={editingCouncil?.topicTitle || selectedTopic?.topicTitle}
            />
          </Form.Item>

          {/* Milestone */}
          <Form.Item
            name="milestone"
            label="Milestone"
            rules={[{ required: true, message: 'Vui lòng chọn milestone!' }]}
          >
            <Select placeholder="Chọn milestone" disabled={!!editingCouncil}>
              {milestoneOptions.map((milestone) => (
                <Option key={milestone.value} value={milestone.value}>
                  {milestone.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Ngày review */}
          {(showReviewDateField || !!editingCouncil) && (
            <Form.Item
              name="reviewDate"
              label="Ngày review"
              rules={[
                {
                  // Yêu cầu nhập khi tạo council LẦN ĐẦU
                  required: !editingCouncil && showReviewDateField,
                  message: 'Vui lòng chọn ngày review!',
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                // (FIXED) Quay lại logic gốc:
                // Chỉ disable khi TẠO MỚI và KHÔNG PHẢI council đầu tiên
                disabled={!editingCouncil && !showReviewDateField}
              />
            </Form.Item>
          )}

          {/* Hình thức review */}
          <Form.Item
            name="reviewFormat"
            label="Hình thức review"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức review!' }]}
          >
            <Select
              onChange={(value) => {
                form.setFieldsValue({
                  meetingLink: undefined,
                  roomNumber: undefined,
                });
              }}
            >
              <Option value="ONLINE">Online</Option>
              <Option value="OFFLINE">Offline</Option>
            </Select>
          </Form.Item>

          {/* Link/Room dependent field */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.reviewFormat !== curr.reviewFormat}
          >
            {({ getFieldValue }) => {
              const format = getFieldValue('reviewFormat');
              if (format === 'ONLINE') {
                return (
                  <Form.Item
                    name="meetingLink"
                    label="Link họp"
                    rules={[{ required: true, message: 'Vui lòng nhập link meeting!' }]}
                  >
                    <Input placeholder="Nhập link meeting (Zoom, Meet...)" />
                  </Form.Item>
                );
              }
              if (format === 'OFFLINE') {
                return (
                  <Form.Item
                    name="roomNumber"
                    label="Phòng họp"
                    rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
                  >
                    <Input placeholder="Nhập số phòng (VD: 302, A1.201...)" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          {/* Giảng viên */}
          <Form.Item
            name="lecturerAccountIds"
            label="Giảng viên"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn giảng viên!',
              },
              {
                validator: (_, value) => {
                  if (!value || value.length !== 2) {
                    return Promise.reject('Phải chọn đúng 2 giảng viên!');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn giảng viên"
              maxTagCount={3}
              showSearch
              optionFilterProp="children" // Giữ nguyên để search
              loading={loadingLecturers}
              
              // (FIXED) Cập nhật filter để đảm bảo có email (nếu email là bắt buộc)
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {(() => {
                // Lấy danh sách giảng viên hiện tại trong hội đồng (nếu đang chỉnh sửa)
                const currentMembers = editingCouncil 
                  ? editingCouncil.lecturers.map(lec => ({
                      accountID: typeof lec.accountID === 'string' ? Number(lec.accountID) : lec.accountID,
                      accountName: lec.accountName,
                      email: lec.email || ''
                    }))
                  : [];
                
                // Tạo Set để lưu các ID đã có trong danh sách lecturers
                const lecturerIdsSet = new Set(
                  lecturers
                    .filter((lec) => lec.accountID != null)
                    .map((lec) => typeof lec.accountID === 'string' ? Number(lec.accountID) : lec.accountID)
                );
                
                // Thêm các giảng viên hiện tại vào danh sách nếu chưa có
                const allLecturers = [...lecturers];
                currentMembers.forEach(currentMember => {
                  if (!lecturerIdsSet.has(currentMember.accountID)) {
                    allLecturers.push({
                      accountID: currentMember.accountID,
                      accountName: currentMember.accountName,
                      email: currentMember.email
                    });
                  }
                });
                
                return allLecturers
                  // Cho phép hiển thị cả giảng viên chưa có email
                  .filter((lec) => lec.accountID != null && lec.accountName)
                  .map((lec) => {
                    const optionLabel = lec.email
                      ? `${lec.accountName} (${lec.email})`
                      : lec.accountName;
                    // Đảm bảo accountID là number để so sánh đúng
                    const accountIdValue = typeof lec.accountID === 'string' 
                      ? Number(lec.accountID) 
                      : lec.accountID;
                    return (
                      <Option key={accountIdValue} value={accountIdValue}>
                        {optionLabel}
                      </Option>
                    );
                  });
              })()}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết council từ calendar (HOD + Lecturer) */}
      <Modal
        title={`Chi tiết hội đồng: ${selectedCouncil?.name}`}
        open={isCouncilDetailModalVisible}
        onCancel={() => setIsCouncilDetailModalVisible(false)}
        footer={[
          <Button
            key="detail"
            type="primary"
            onClick={() => {
              if (selectedCouncil) {
                router.push(`/review-council/grade?id=${selectedCouncil.id}`);
              }
            }}
          >
            Xem chi tiết
          </Button>,
        ]}
        width={700}
      >
        {selectedCouncil ? (
          <>
            {/* (FIXED) Sửa lỗi layout cho Descriptions */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Đề tài" span={2}>
                {selectedCouncil.topicTitle}
              </Descriptions.Item>

              <Descriptions.Item label="Mốc review">
                <Tag color={getMilestoneColor(selectedCouncil.milestone)}>
                  {selectedCouncil.milestone.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày review">
                {selectedCouncil.reviewDate
                  ? dayjs(selectedCouncil.reviewDate).format('DD/MM/YYYY')
                  : 'Chưa có'}
              </Descriptions.Item>

              <Descriptions.Item label="Hình thức">
                {selectedCouncil.reviewFormat}
              </Descriptions.Item>

              {selectedCouncil.reviewFormat === 'ONLINE' ? (
                <Descriptions.Item label="Link meeting" span={1}>
                  <a
                    href={selectedCouncil.meetingLink ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link
                  </a>
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="Phòng" span={1}>
                  {selectedCouncil.roomNumber}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCouncil.status)}>
                  {selectedCouncil.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Kết quả">
                <Tag color={getResultColor(selectedCouncil.result)}>
                  {selectedCouncil.result}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left" style={{ marginTop: 24 }}>
              Thành viên hội đồng
            </Divider>
            <List
              itemLayout="horizontal"
              dataSource={selectedCouncil.lecturers}
              renderItem={(lec, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="flex justify-between items-center w-full">
                        <Tag color={index % 2 === 0 ? 'blue' : 'purple'}>
                          {lec.accountName}
                        </Tag>
                        {lec.decision === 'Chấp nhận' && (
                          <Tag color="green">Chấp nhận</Tag>
                        )}
                        {lec.decision === 'Từ chối' && (
                          <Tag color="red">Từ chối</Tag>
                        )}
                        {lec.decision === 'Chưa chấm' && (
                          <Tag color="gray">Chưa chấm</Tag>
                        )}
                      </div>
                    }
                    description={lec.overallComments || <em>Chưa có nhận xét</em>}
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <p>Không có thông tin hội đồng.</p>
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Layout>
  );
}