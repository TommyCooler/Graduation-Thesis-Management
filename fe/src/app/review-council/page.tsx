'use client';
import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Card, Typography, Spin, Tooltip, List, Descriptions, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, TeamOutlined, CheckCircleOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import reviewCouncilService, { ReviewCouncilUIModel, Lecturer } from '../../services/reviewCouncilService';
import topicService from '@/services/topicService';
import { ApprovedTopic } from '../../types/topic';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, dayjsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Style cho calendar
import CustomToolbar from '../../components/CustomToolbar'

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;
const localizer = dayjsLocalizer(dayjs);


export default function ReviewCouncilPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCouncil, setEditingCouncil] = useState<ReviewCouncilUIModel | null>(null);

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);

  const [approvedTopics, setApprovedTopics] = useState<ApprovedTopic[]>([]);
  const [loadingApprovedTopics, setLoadingApprovedTopics] = useState(false);

  // 🔹 State cho modal hiển thị hội đồng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ApprovedTopic | null>(null);
  const [councils, setCouncils] = useState<ReviewCouncilUIModel[]>([]);
  const [loadingCouncils, setLoadingCouncils] = useState(false);

  const [showReviewDateField, setShowReviewDateField] = useState(false);

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentForm] = Form.useForm();
  const [selectedCouncilId, setSelectedCouncilId] = useState<number | null>(null);

  // Thêm cùng nhóm với các useState khác
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingCouncilId, setApprovingCouncilId] = useState<number | null>(null);

  // Thêm state mới cho chế độ LỊCH
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table'); // Mặc định là table
  const [allCouncils, setAllCouncils] = useState<ReviewCouncilUIModel[]>([]);
  const [loadingAllCouncils, setLoadingAllCouncils] = useState(false);
  const [isCouncilDetailModalVisible, setIsCouncilDetailModalVisible] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState<ReviewCouncilUIModel | null>(null);
  // Thêm 2 state này cùng với các useState khác của bạn
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>('month'); // Mặc định là 'month'


  // Gọi API lấy danh sách hội đồng theo topicID
  const handleViewCouncils = async (topic: ApprovedTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
    setLoadingCouncils(true);

    try {
      const data = await reviewCouncilService.getCouncilsByTopicID(topic.topicID);

      // 🔹 Sắp xếp theo ngày review tăng dần (null sẽ nằm cuối)
      const sortedData = [...data].sort((a, b) => {
        if (!a.reviewDate) return 1;
        if (!b.reviewDate) return -1;
        return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      });

      setCouncils(sortedData);
    } catch (err) {
      console.error('Lỗi khi tải hội đồng:', err);
      setCouncils([]);
    } finally {
      setLoadingCouncils(false);
    }
  };

  // Hàm fetch all councils
  const fetchAllCouncils = async () => {
    try {
      setLoadingAllCouncils(true);
      const data = await reviewCouncilService.getAllCouncils();
      // Sắp xếp theo reviewDate
      const sortedData = [...data].sort((a, b) => {
        if (!a.reviewDate) return 1;
        if (!b.reviewDate) return -1;
        return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
      });
      setAllCouncils(sortedData);
    } catch (err) {
      console.error('Lỗi khi tải tất cả hội đồng:', err);
      setAllCouncils([]);
      toast.error('Không thể tải danh sách hội đồng cho lịch');
    } finally {
      setLoadingAllCouncils(false);
    }
  };


  const milestoneOptions = [
    { label: 'WEEK 4', value: 'WEEK_4' },
    { label: 'WEEK 8', value: 'WEEK_8' },
    { label: 'WEEK 12', value: 'WEEK_12' },
  ];

  useEffect(() => {
    fetchLecturers();
    fetchApprovedTopics();
    fetchAllCouncils();
  }, []);

  const fetchApprovedTopics = async () => {
    try {
      setLoadingApprovedTopics(true);
      const data = await topicService.getApprovedTopics();
      setApprovedTopics(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách topic được duyệt:', err);
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
      console.error('Lỗi khi tải danh sách giảng viên:', err);
      setLecturers([]);
    } finally {
      setLoadingLecturers(false);
    }
  };

  //  Xử lý khi nhấn nút "Tạo hội đồng" trong modal
  const handleCreateCouncil = async () => {
    if (!selectedTopic) return;

    // Kiểm tra topic đã có hội đồng nào chưa
    const existingCouncils = await reviewCouncilService.getCouncilsByTopicID(selectedTopic.topicID);

    // Chỉ hiển thị trường reviewDate nếu là hội đồng đầu tiên (Milestone WEEK 4)
    setShowReviewDateField(existingCouncils.length === 0);

    setEditingCouncil(null); // Đảm bảo là tạo mới
    setIsModalVisible(true);
    form.resetFields();

    // Set giá trị mặc định cho form
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        topicID: selectedTopic.topicID,
        topicTitle: selectedTopic.topicTitle,
        milestone: existingCouncils.length === 0 ? 'WEEK_4' : 'WEEK_8',
      });
    }, 0);


  };

  // Hàm convert councils thành events cho calendar
  const getCalendarEvents = () => {
    return allCouncils
      .filter((council) => council.reviewDate) // Chỉ lấy council có reviewDate
      .map((council) => ({
        id: council.id,
        title: council.name, // Title cho event (hiển thị nếu cần)
        start: dayjs(council.reviewDate).startOf('day').toDate(), // Bắt đầu ngày
        end: dayjs(council.reviewDate).endOf('day').toDate(), // Kết thúc ngày
        allDay: true,
        resource: council, // Lưu toàn bộ council để dùng khi click
      }));
  };

  // Component tùy chỉnh cho event trên calendar
  const CustomEvent = ({ event }: { event: any }) => {
    return (
      <Tooltip title={event.title}>
        <TeamOutlined style={{ color: '#1890ff', fontSize: 20 }} /> {/* Icon hội đồng */}
      </Tooltip>
    );
  };

  // Đóng modal tạo/sửa
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCouncil(null);
  };

  // Xử lý submit form tạo/cập nhật hội đồng
  const handleOk = async () => {
    if (!selectedTopic) {
      toast.error('Lỗi: Không tìm thấy đề tài đã chọn.');
      return;
    }

    try {
      const values = await form.validateFields();

      const reviewDateValue: dayjs.Dayjs | undefined = values.reviewDate;

      const payload = {
        topicID: selectedTopic.topicID,
        milestone: values.milestone,
        reviewDate: reviewDateValue?.isValid()
          ? reviewDateValue.toISOString()
          : (showReviewDateField ? null : undefined),
        reviewFormat: values.reviewFormat,
        meetingLink: values.meetingLink || null,
        roomNumber: values.roomNumber || null,
        lecturerAccountIds: values.lecturerAccountIds || [],
      };

      await reviewCouncilService.createCouncil(payload);
      toast.success('Tạo hội đồng thành công!');
      await handleViewCouncils(selectedTopic);
      await fetchAllCouncils(); // Cập nhật lại lịch

      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(`${error.message}`);
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin');
      }
      console.error('Chi tiết lỗi:', error);
    }
  };

  //  Màu Tag
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã lập':
        return 'blue';
      case 'Đã duyệt':
        return 'green';
      case 'Đã hủy':
        return 'red';
      default:
        return 'default';
    }
  };

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



  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="p-6 bg-gray-100">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

            {/* Button switch chế độ xem */}
            <Space style={{ marginBottom: 16 }}>
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

            {/* PHẦN SỬA LỖI Ở ĐÂY: Xóa cặp {} thừa */}
            {viewMode === 'table' ? (
              loadingApprovedTopics ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={approvedTopics}
                  rowKey="topicID"
                  bordered
                  pagination={{ pageSize: 5 }}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {/*  STT */}
                  <Table.Column
                    title="STT"
                    key="index"
                    align="center"
                    width={80}
                    render={(_, __, index) => index + 1}
                  />

                  {/* Tên đề tài */}
                  <Table.Column
                    title="Tên đề tài"
                    dataIndex="topicTitle"
                    key="topicTitle"
                    render={(text: string) => (
                      <span style={{ fontWeight: 500 }}>{text}</span>
                    )}
                  />

                  {/* Mô tả */}
                  <Table.Column
                    title="Mô tả"
                    dataIndex="description"
                    key="description"
                    render={(text: string) => (
                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ marginBottom: 0 }}
                      >
                        {text}
                      </Paragraph>
                    )}
                  />

                  {/* Hội đồng */}
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
              )
            ) : (
              // Phần calendar
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
                  style={{ height: 600 }} // Chiều cao calendar
                  views={['month', 'week', 'day']} // Các view hỗ trợ
                  date={calendarDate}        // 🔹 Luôn hiển thị ngày từ state
                  view={calendarView}       // 🔹 Luôn hiển thị view từ state
                  onNavigate={setCalendarDate} // 🔹 Khi nhấn Next/Back, cập nhật state ngày
                  onView={setCalendarView}
                  defaultView="month" // Mặc định tháng
                  components={{
                    toolbar: CustomToolbar, // Sử dụng toolbar tùy chỉnh
                    event: CustomEvent,
                  }}
                  onSelectEvent={(event) => {
                    setSelectedCouncil(event.resource); // Lấy council từ resource
                    setIsCouncilDetailModalVisible(true);
                  }}
                />
              )
            )}
          </Card>
        </div>
      </Content >
      <Footer />

      {/* Modal hiển thị hội đồng */}
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCouncil}
          >
            Tạo hội đồng mới
          </Button>
        }
        width={1000} // mở rộng modal để hiển thị thoải mái hơn
      >
        {loadingCouncils ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin size="large" />
          </div>
        ) : councils.length > 0 ? (
          <Table
            dataSource={councils}
            rowKey="id"
            bordered
            pagination={false} // bỏ phân trang
            scroll={{ x: 'max-content' }}
          >
            <Table.Column
              title="Tên hội đồng"
              dataIndex="name"
              key="name"
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
                <span style={{ whiteSpace: 'nowrap' }}>{text}</span> // giữ ngày trên một dòng
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
                      style={{ color: '#1677ff', textDecoration: 'underline' }}
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
            />
            <Table.Column
              title="Giảng viên 1"
              key="lecturer1"
              render={(_, record: ReviewCouncilUIModel) =>
                record.lecturers[0] ? (
                  <div
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      padding: '6px 10px',
                      background: '#fafafa',
                    }}
                  >
                    <Tag color="purple" style={{ fontWeight: 600, fontSize: '13px' }}>
                      {record.lecturers[0].accountName}
                    </Tag>
                    <div style={{ marginTop: 4, color: '#555' }}>
                      {record.lecturers[0].overallComments?.trim()
                        ? record.lecturers[0].overallComments
                        : <i>Chưa có nhận xét</i>}
                    </div>
                  </div>
                ) : (
                  <i>Chưa có nhận xét</i>
                )
              }
            />

            <Table.Column
              title="Giảng viên 2"
              key="lecturer2"
              render={(_, record: ReviewCouncilUIModel) =>
                record.lecturers[1] ? (
                  <div
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      padding: '6px 10px',
                      background: '#fafafa',
                    }}
                  >
                    <Tag color="magenta" style={{ fontWeight: 600, fontSize: '13px' }}>
                      {record.lecturers[1].accountName}
                    </Tag>
                    <div style={{ marginTop: 4, color: '#555' }}>
                      {record.lecturers[1].overallComments?.trim()
                        ? record.lecturers[1].overallComments
                        : <i>Chưa có nhận xét</i>}
                    </div>
                  </div>
                ) : (
                  <i>Chưa có nhận xét</i>
                )
              }
            />
            {/* Cột hành động */}
            <Table.Column
              title="Hành động"
              key="actions"
              align="center"
              width={120}
              render={(_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <Tooltip title="Nhận xét">
                    <Button
                      type="text"
                      icon={<CommentOutlined style={{ color: '#1677ff' }} />}
                      onClick={() => {
                        setSelectedCouncilId(record.id);
                        commentForm.setFieldsValue({ overallComments: '' });
                        setIsCommentModalVisible(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={record.status === 'Đã duyệt' ? 'Đã duyệt' : 'Duyệt hội đồng'}>
                    <Button
                      type="text"
                      icon={<CheckCircleOutlined style={{ color: record.status === 'Đã duyệt' ? 'gray' : 'green' }} />}
                      disabled={record.status === 'Đã duyệt'}
                      onClick={() => {
                        console.log("Nút duyệt được click", record.id);
                        setApprovingCouncilId(record.id);
                        setApproveModalOpen(true);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => console.log('Delete', record.id)}
                    />
                  </Tooltip>
                </div>
              )}
            />
          </Table>
        ) : (
          <p style={{ textAlign: 'center', padding: 20 }}>
            Không có hội đồng nào cho đề tài này.
          </p>
        )}
      </Modal>

      {/* Modal TẠO/SỬA hội đồng */}
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
            <Input disabled value={selectedTopic?.topicTitle} />
          </Form.Item>

          {/* Milestone */}
          <Form.Item
            name="milestone"
            label="Milestone"
            rules={[{ required: true, message: 'Vui lòng chọn milestone!' }]}
          >
            <Select placeholder="Chọn milestone">
              {milestoneOptions.map((milestone) => (
                <Option key={milestone.value} value={milestone.value}>
                  {milestone.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Chỉ hiển thị ngày review nếu là hội đồng đầu tiên */}
          {showReviewDateField && (
            <Form.Item
              name="reviewDate"
              label="Ngày review"
              rules={[{ required: showReviewDateField, message: 'Vui lòng chọn ngày review!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
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
                // Reset link/phòng khi đổi format
                form.setFieldsValue({ meetingLink: undefined, roomNumber: undefined });
              }}
            >
              <Option value="ONLINE">Online</Option>
              <Option value="OFFLINE">Offline</Option>
            </Select>
          </Form.Item>

          {/* Link meeting nếu ONLINE */}
          {/* Lắng nghe thay đổi để hiện động các trường */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.reviewFormat !== curr.reviewFormat}>
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
              optionFilterProp="children"
              loading={loadingLecturers}
            >
              {lecturers
                .filter((lec) => lec.accountID != null && lec.accountName)
                .map((lec) => (
                  <Option key={lec.accountID} value={lec.accountID}>
                    {lec.accountName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nhập nhận xét */}
      <Modal
        title="Nhận xét hội đồng"
        open={isCommentModalVisible}
        onCancel={() => setIsCommentModalVisible(false)}
        onOk={async () => {
          try {
            const values = await commentForm.validateFields();
            if (!selectedCouncilId) return;

            await reviewCouncilService.updateCouncilComment(
              selectedCouncilId,
              values.overallComments
            );

            toast.success('Cập nhật nhận xét thành công!');
            setIsCommentModalVisible(false);
            commentForm.resetFields();

            // Refresh lại danh sách hội đồng nếu có đề tài đang chọn
            if (selectedTopic) await handleViewCouncils(selectedTopic);
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Không thể cập nhật nhận xét');
          }
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={commentForm} layout="vertical">
          <Form.Item
            name="overallComments"
            label="Nhận xét"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nhận xét của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={approveModalOpen}
        title="Xác nhận duyệt hội đồng"
        onCancel={() => setApproveModalOpen(false)}
        onOk={async () => {
          if (!approvingCouncilId) return;
          try {
            await reviewCouncilService.updateCouncilStatus(approvingCouncilId);
            toast.success('Cập nhật trạng thái thành công!');
            setApproveModalOpen(false);
            if (selectedTopic) await handleViewCouncils(selectedTopic);
            await fetchAllCouncils(); // Cập nhật lại lịch
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Không thể cập nhật trạng thái');
          }
        }}
        okText="Duyệt"
        cancelText="Hủy"
        centered
      >
        <p>Bạn có chắc chắn muốn duyệt hội đồng này không?</p>
      </Modal>

      {/* Modal chi tiết council từ calendar */}
      <Modal
        title={`Chi tiết hội đồng: ${selectedCouncil?.name}`}
        open={isCouncilDetailModalVisible}
        onCancel={() => setIsCouncilDetailModalVisible(false)}
        footer={null} // Không cần nút bấm
        width={700}   // Có thể điều chỉnh lại độ rộng
      >
        {selectedCouncil ? (
          <>
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

              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedCouncil.status)}>
                  {selectedCouncil.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Hình thức">
                {selectedCouncil.reviewFormat}
              </Descriptions.Item>

              {selectedCouncil.reviewFormat === 'ONLINE' ? (
                <Descriptions.Item label="Link meeting" span={2}>
                  <a href={selectedCouncil.meetingLink ?? '#'} target="_blank" rel="noopener noreferrer">
                    {selectedCouncil.meetingLink}
                  </a>
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="Phòng" span={2}>
                  {selectedCouncil.roomNumber}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left" style={{ marginTop: 24 }}>Thành viên hội đồng</Divider>

            <List
              itemLayout="horizontal"
              dataSource={selectedCouncil.lecturers}
              renderItem={(lec, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Tag color={index % 2 === 0 ? "blue" : "purple"}>{lec.accountName}</Tag>}
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

    </Layout >
  );
}