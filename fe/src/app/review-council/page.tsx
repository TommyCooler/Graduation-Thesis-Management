'use client';
import React, { useEffect, useState } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Card, Typography, Spin, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import reviewCouncilService, { ReviewCouncilUIModel, Lecturer } from '../../services/reviewCouncilService';
import topicService from '@/services/topicService';
import { Topic, ApprovedTopic } from '../../types/topic';
import { ReviewCouncilMember } from '../../services/reviewCouncilService';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;


export default function ReviewCouncilPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCouncil, setEditingCouncil] = useState<ReviewCouncilUIModel | null>(null);

  // const [councils, setCouncils] = useState<ReviewCouncilUIModel[]>([]);
  // const [loading, setLoading] = useState(false);

  // const [topics, setTopics] = useState<Topic[]>([]);
  // const [loadingTopics, setLoadingTopics] = useState(false);

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

  // 📦 Gọi API lấy danh sách hội đồng theo topicID
  const handleViewCouncils = async (topic: ApprovedTopic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
    setLoadingCouncils(true);

    try {
      const data = await reviewCouncilService.getCouncilsByTopicID(topic.topicID);
      setCouncils(data);
    } catch (err) {
      console.error('Lỗi khi tải hội đồng:', err);
      setCouncils([]);
    } finally {
      setLoadingCouncils(false);
    }
  };

  //   const handleCreateCouncil = async (topic: ApprovedTopic) => {
  //   setSelectedTopic(topic);

  //   // 🔹 Kiểm tra topic đã có hội đồng nào chưa
  //   const existingCouncils = await reviewCouncilService.getCouncilsByTopicID(topic.topicID);

  //   if (existingCouncils.length === 0) {
  //     setShowReviewDateField(true); // hiển thị trường reviewDate (WEEK 4)
  //   } else {
  //     setShowReviewDateField(false); // ẩn đi, backend tự set
  //   }

  //   form.resetFields();
  //   setIsModalVisible(true);
  // };


  const milestoneOptions = [
    { label: 'WEEK 4', value: 'WEEK_4' },
    { label: 'WEEK 8', value: 'WEEK_8' },
    { label: 'WEEK 12', value: 'WEEK_12' },
  ];

  useEffect(() => {
    // fetchCouncils();
    // fetchTopics();
    fetchLecturers();
    fetchApprovedTopics();
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

  // // 🔹 Xử lý khi nhấn nút "Tạo hội đồng" trong modal
  const handleCreateCouncil = async () => {
    if (!selectedTopic) return;

    // 🔹 Kiểm tra topic đã có hội đồng nào chưa
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

  // ❌ Đóng modal tạo/sửa
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCouncil(null);
  };


  //   // 🟩 Mở modal tạo mới
  //   const showModal = () => {
  //     setEditingCouncil(null);
  //     form.resetFields();
  //     setIsModalVisible(true);
  //   };

  //   // 🟨 Sửa hội đồng
  //   const handleEdit = (record: ReviewCouncilUIModel) => {
  //     setEditingCouncil(record);
  //     form.setFieldsValue({
  //       ...record,
  //       reviewDate: record.reviewDate,
  //     });
  //     setIsModalVisible(true);
  //   };

  //   // 🟥 Xóa hội đồng
  //   const handleDelete = (id: number) => {
  //     Modal.confirm({
  //       title: 'Xác nhận xóa',
  //       content: 'Bạn có chắc chắn muốn xóa hội đồng này?',
  //       okText: 'Xóa',
  //       cancelText: 'Hủy',
  //       okButtonProps: { danger: true },
  //       onOk: () => {
  //         setCouncils((prev) => prev.filter((c) => c.id !== id));
  //       },
  //     });
  //   };

  // ✅ Xử lý submit form tạo/cập nhật hội đồng
  const handleOk = async () => {
    if (!selectedTopic) {
      toast.error('Lỗi: Không tìm thấy đề tài đã chọn.');
      return;
    }

    try {
      const values = await form.validateFields();

      const reviewDateValue: dayjs.Dayjs | undefined = values.reviewDate;

      const payload = {
        name: values.name,
        topicID: selectedTopic.topicID,
        milestone: values.milestone,
        // Dùng moment để format DatePicker về ISO string, 
        // hoặc null nếu không phải WEEK_4 và không có giá trị
        reviewDate: reviewDateValue?.isValid()
          ? reviewDateValue.toISOString()
          : (showReviewDateField ? null : undefined),
        lecturerAccountIds: values.lecturerAccountIds || [],
      };

      if (editingCouncil) {
        // TODO: Gọi API update (chưa có trong file .ts)
        toast.warning('Tính năng cập nhật chưa được triển khai.');
      } else {
        // API tạo mới
        await reviewCouncilService.createCouncil(payload);
        toast.success('Tạo hội đồng thành công!');
      }

      // 🔄 Cập nhật lại danh sách hội đồng trong modal hiện tại
      await handleViewCouncils(selectedTopic);

      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      // 🛑 Bắt lỗi từ backend hoặc axios
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

  //   const handleCancel = () => {
  //     setIsModalVisible(false);
  //     form.resetFields();
  //   };

  //   // 🎨 Màu Tag
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

            {loadingApprovedTopics ? (
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
                {/* 🧾 STT */}
                <Table.Column
                  title="STT"
                  key="index"
                  align="center"
                  width={80}
                  render={(_, __, index) => index + 1}
                />

                {/* 📘 Tên đề tài */}
                <Table.Column
                  title="Tên đề tài"
                  dataIndex="topicTitle"
                  key="topicTitle"
                  render={(text: string) => (
                    <span style={{ fontWeight: 500 }}>{text}</span>
                  )}
                />

                {/* 📝 Mô tả */}
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

                {/* 👁️ Hội đồng */}
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
          </Card>
        </div>
      </Content>
      <Footer />

      {/* 🧩 Modal hiển thị hội đồng */}
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
        width={1000} // 🔥 mở rộng modal để hiển thị thoải mái hơn
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
            pagination={false} // ❌ bỏ phân trang
            scroll={{ x: 'max-content' }}
          >
            <Table.Column
              title="Tên hội đồng"
              dataIndex="name"
              key="name"
              render={(text) => <strong>{text}</strong>}
            />
            <Table.Column
              title="Milestone"
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
                <span style={{ whiteSpace: 'nowrap' }}>{text}</span> // ✅ giữ ngày trên một dòng
              )}
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


            {/* <Table.Column
              title="Nhận xét chung"
              dataIndex="feedback"
              key="feedback"
              render={(text) => text || <i>Chưa có nhận xét</i>}
            /> */}
            {/* ⚙️ Cột hành động */}
            <Table.Column
              title="Hành động"
              key="actions"
              align="center"
              width={120}
              render={(_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="text"
                      icon={<EditOutlined style={{ color: '#1677ff' }} />}
                      onClick={() => console.log('Edit', record.id)}
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


      {/* ➕ Modal TẠO/SỬA hội đồng */}
      <Modal
        title={editingCouncil ? 'Chỉnh sửa hội đồng' : 'Tạo hội đồng mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText={editingCouncil ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
        confirmLoading={loadingCouncils} // Tạm dùng chung loading

      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'Đã lập',
          }}
        >
          <Form.Item
            name="topicTitle"
            label="Đề tài"
          // Không cần rules vì topicID đã được set
          >
            <Input
              disabled
              placeholder="Tên đề tài"
              value={selectedTopic?.topicTitle}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên hội đồng"
            rules={[{ required: true, message: 'Vui lòng nhập tên hội đồng!' }]}
          >
            <Input placeholder="Nhập tên hội đồng" />
          </Form.Item>

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

          {/* 📅 Chỉ hiển thị Ngày Review nếu là hội đồng đầu tiên (WEEK 4) */}
          {showReviewDateField && (
            <Form.Item
              name="reviewDate"
              label="Ngày review"
              rules={[{ required: showReviewDateField, message: 'Vui lòng chọn ngày review!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          )}

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
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

    </Layout>
  );
}
