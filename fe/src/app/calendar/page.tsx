'use client';

import { useState } from 'react';
import {
  Layout,
  Card,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Typography,
  Tag,
  message,
  TimePicker,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isoWeek from 'dayjs/plugin/isoWeek';
import Header from '@/components/combination/Header';
import Footer from '@/components/combination/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

dayjs.locale('vi');
dayjs.extend(isoWeek);

const TIME_SLOTS = [
  { slot: 1, start: '7:00', end: '9:15' },
  { slot: 2, start: '9:30', end: '11:45' },
  { slot: 3, start: '12:30', end: '14:45' },
  { slot: 4, start: '15:00', end: '17:15' },
  { slot: 5, start: '17:30', end: '19:45' },
  { slot: 6, start: '20:00', end: '22:15' },
];

// Define event type
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  slot: number; // 1-8
  type: 'class' | 'meeting' | 'exam' | 'other';
  description?: string;
  location?: string;
  participants?: string[];
}

// Mock data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'EXE201',
    date: '2025-10-20',
    slot: 1,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '2',
    title: 'MSS301',
    date: '2025-10-21',
    slot: 1,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '3',
    title: 'PRM392',
    date: '2025-10-22',
    slot: 2,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '4',
    title: 'MLN122',
    date: '2025-10-22',
    slot: 3,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '5',
    title: 'MSS301',
    date: '2025-10-25',
    slot: 1,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '6',
    title: 'PRM392',
    date: '2025-10-25',
    slot: 2,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
  {
    id: '7',
    title: 'MLN122',
    date: '2025-10-25',
    slot: 3,
    type: 'class',
    description: 'Học tại nhà văn hóa Sinh viên, khu Đại học quốc gia',
    location: 'NVH',
  },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentWeek, setCurrentWeek] = useState<Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; slot: number } | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');

  // Get month days for calendar view
  const getMonthDays = (date: Dayjs) => {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    
    const days: Dayjs[] = [];
    let currentDate = startDate;
    
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      days.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }
    
    return days;
  };

  // Get week days (Monday to Sunday)
  const getWeekDays = (date: Dayjs) => {
    const startOfWeek = date.startOf('isoWeek');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  };

  const monthDays = getMonthDays(currentWeek);
  const weekDays = getWeekDays(currentWeek);

  // Get events for a specific date and slot
  const getEventForSlot = (date: Dayjs, slot: number) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.find((event) => event.date === dateStr && event.slot === slot);
  };

  // Get all events for a specific date
  const getEventsForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter((event) => event.date === dateStr);
  };

  // Get event type color
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      class: '#1890ff',
      meeting: '#52c41a',
      exam: '#ff4d4f',
      other: '#722ed1',
    };
    return colors[type];
  };

  // Navigate to previous month/week
  const previousPeriod = () => {
    setCurrentWeek(currentWeek.subtract(1, viewMode === 'month' ? 'month' : 'week'));
  };

  // Navigate to next month/week
  const nextPeriod = () => {
    setCurrentWeek(currentWeek.add(1, viewMode === 'month' ? 'month' : 'week'));
  };

  // Go to current week
  const goToToday = () => {
    setCurrentWeek(dayjs());
  };

  // Show add event modal
  const showAddModal = (date: string, slot: number) => {
    setIsEditMode(false);
    setCurrentEvent(null);
    setSelectedSlot({ date, slot });
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(date),
      slot: slot,
    });
    setIsModalVisible(true);
  };

  // Show edit event modal
  const showEditModal = (event: CalendarEvent) => {
    setIsEditMode(true);
    setCurrentEvent(event);
    form.setFieldsValue({
      ...event,
      date: dayjs(event.date),
    });
    setIsModalVisible(true);
  };

  // Handle modal OK
  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const eventData: CalendarEvent = {
        id: isEditMode && currentEvent ? currentEvent.id : Date.now().toString(),
        title: values.title,
        date: values.date.format('YYYY-MM-DD'),
        slot: values.slot,
        type: values.type,
        description: values.description,
        location: values.location,
        participants: values.participants,
      };

      if (isEditMode && currentEvent) {
        setEvents(events.map((e) => (e.id === currentEvent.id ? eventData : e)));
        message.success('Cập nhật sự kiện thành công!');
      } else {
        setEvents([...events, eventData]);
        message.success('Thêm sự kiện thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // Handle delete event
  const handleDeleteEvent = (eventId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sự kiện này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setEvents(events.filter((e) => e.id !== eventId));
        message.success('Đã xóa sự kiện!');
      },
    });
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />

      <Content className="p-4 sm:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header with Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                  <Button
                    type={viewMode === 'week' ? 'default' : 'text'}
                    onClick={() => setViewMode('week')}
                    className={viewMode === 'week' ? 'bg-gray-100' : ''}
                  >
                    List
                  </Button>
                  <Button
                    type={viewMode === 'month' ? 'default' : 'text'}
                    onClick={() => setViewMode('month')}
                    className={viewMode === 'month' ? 'bg-gray-100' : ''}
                  >
                    Calendar
                  </Button>
                </div>
                <Select
                  defaultValue="all"
                  className="w-32"
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'class', label: 'Classes' },
                    { value: 'meeting', label: 'Meetings' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={previousPeriod} icon={<LeftOutlined />} />
                <Button onClick={goToToday}>Today</Button>
                <Button onClick={nextPeriod} icon={<RightOutlined />} />
                <div className="text-base font-semibold ml-2">
                  {viewMode === 'month' 
                    ? currentWeek.format('MMMM YYYY')
                    : `Week ${currentWeek.isoWeek()}, ${currentWeek.year()}`
                  }
                </div>
              </div>

              <Button type="primary" icon={<PlusOutlined />} className="bg-orange-500 hover:bg-orange-600">
                Add Task
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm border-r border-gray-100 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7">
                {monthDays.map((day, index) => {
                  const isCurrentMonth = day.month() === currentWeek.month();
                  const isToday = day.isSame(dayjs(), 'day');
                  const dayEvents = getEventsForDate(day);

                  return (
                    <div
                      key={day.format('YYYY-MM-DD')}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                      } ${index % 7 === 6 ? 'border-r-0' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => showAddModal(day.format('YYYY-MM-DD'), 1)}
                    >
                      <div className={`text-sm mb-2 ${
                        isToday 
                          ? 'bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold' 
                          : isCurrentMonth 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-400'
                      }`}>
                        {day.date()}
                      </div>

                      {/* Events for this day */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${
                              event.type === 'class'
                                ? 'bg-purple-500'
                                : event.type === 'meeting'
                                ? 'bg-green-500'
                                : event.type === 'exam'
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              showEditModal(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-2">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Week View (Table format like original)
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="bg-gray-50 font-medium text-gray-600 w-20 p-3 text-left sticky left-0 z-10">
                      Time
                    </th>
                    {weekDays.map((day) => {
                      const isToday = day.isSame(dayjs(), 'day');
                      return (
                        <th 
                          key={day.format('YYYY-MM-DD')} 
                          className={`font-medium p-3 text-center min-w-[140px] ${
                            isToday ? 'bg-orange-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`text-sm ${isToday ? 'text-orange-600' : 'text-gray-600'}`}>
                            {day.format('ddd')}
                          </div>
                          <div className={`text-2xl font-semibold mt-1 ${
                            isToday 
                              ? 'bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto' 
                              : 'text-gray-900'
                          }`}>
                            {day.date()}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot) => (
                    <tr key={timeSlot.slot} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="bg-gray-50 font-medium text-gray-600 p-3 text-xs sticky left-0 z-10">
                        <div>Slot {timeSlot.slot}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {timeSlot.start}-{timeSlot.end}
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const event = getEventForSlot(day, timeSlot.slot);
                        const dateStr = day.format('YYYY-MM-DD');
                        const isToday = day.isSame(dayjs(), 'day');
                        
                        return (
                          <td
                            key={`${dateStr}-${timeSlot.slot}`}
                            className={`p-2 cursor-pointer min-h-[80px] relative transition-colors ${
                              isToday ? 'bg-orange-50/30' : ''
                            } ${event ? '' : 'hover:bg-gray-100'}`}
                            onClick={() => {
                              if (event) {
                                showEditModal(event);
                              } else {
                                showAddModal(dateStr, timeSlot.slot);
                              }
                            }}
                          >
                            {event && (
                              <div
                                className={`text-white p-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow ${
                                  event.type === 'class'
                                    ? 'bg-purple-500 border-l-4 border-purple-700'
                                    : event.type === 'meeting'
                                    ? 'bg-green-500 border-l-4 border-green-700'
                                    : event.type === 'exam'
                                    ? 'bg-blue-500 border-l-4 border-blue-700'
                                    : 'bg-yellow-500 border-l-4 border-yellow-700'
                                }`}
                              >
                                <div className="font-semibold">{event.title}</div>
                                {event.description && (
                                  <div className="text-xs opacity-90 mt-1 line-clamp-1">
                                    {event.description}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="text-xs opacity-80 mt-1">
                                    📍 {event.location}
                                  </div>
                                )}
                                {event.participants && event.participants.length > 0 && (
                                  <div className="flex -space-x-2 mt-2">
                                    {event.participants.slice(0, 3).map((participant, idx) => (
                                      <div
                                        key={idx}
                                        className="w-6 h-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-semibold"
                                        title={participant}
                                      >
                                        {participant.charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                    {event.participants.length > 3 && (
                                      <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">
                                        +{event.participants.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Content>

      {/* Add/Edit Event Modal */}
      <Modal
        title={
          <span>
            <CalendarOutlined className="mr-2" />
            {isEditMode ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={isEditMode ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={700}
        okButtonProps={{
          className: 'bg-[#ff6b35] hover:bg-[#ff8555] border-[#ff6b35]',
        }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
              >
                <Input placeholder="Nhập tiêu đề sự kiện" size="large" />
              </Form.Item>

              <Form.Item
                name="type"
                label="Loại sự kiện"
                rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện!' }]}
              >
                <Select placeholder="Chọn loại sự kiện" size="large">
                  <Select.Option value="class">
                    <Tag color="blue">Lớp học</Tag>
                  </Select.Option>
                  <Select.Option value="meeting">
                    <Tag color="green">Họp</Tag>
                  </Select.Option>
                  <Select.Option value="exam">
                    <Tag color="red">Thi</Tag>
                  </Select.Option>
                  <Select.Option value="other">
                    <Tag color="purple">Khác</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="location" label="Địa điểm">
                <Input placeholder="Nhập địa điểm" size="large" />
              </Form.Item>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
              </Form.Item>

              <Form.Item
                name="slot"
                label="Slot"
                rules={[{ required: true, message: 'Vui lòng chọn slot!' }]}
              >
                <Select placeholder="Chọn slot" size="large">
                  {TIME_SLOTS.map((slot) => (
                    <Select.Option key={slot.slot} value={slot.slot}>
                      Slot {slot.slot} ({slot.start}-{slot.end})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="participants" label="Người tham gia">
                <Select 
                  mode="tags" 
                  placeholder="Nhập tên và nhấn Enter" 
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          {/* Full Width Fields */}
          <Form.Item name="description" label="Mô tả" className="mt-4">
            <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          {isEditMode && (
            <Form.Item className="mb-0">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setIsModalVisible(false);
                  if (currentEvent) {
                    handleDeleteEvent(currentEvent.id);
                  }
                }}
                block
                size="large"
              >
                Xóa sự kiện
              </Button>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Footer />
    </Layout>
  );
}
