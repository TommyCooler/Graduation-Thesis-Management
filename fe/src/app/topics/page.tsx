// =====================================================
// 2) Page: Replace your page with the following
//    - Removed "Ngày nộp" & "File path URL"
//    - Button text changed to "Thêm thành viên"
//    - Added select to choose download format (docx/pdf)
//    - Calls /api/generate-topic-file with chosen format
// =====================================================
'use client';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  message,
  Tag,
  Divider,
  Spin,
  DatePicker,
  Modal,
  Table,
  Affix,
  Select,
} from 'antd';
import { 
  FileOutlined, 
  SendOutlined,
  PlusOutlined,
  TeamOutlined,
  FileWordOutlined,
  CalendarOutlined,
  UserOutlined,
  IdcardOutlined,
  BookOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import React, { JSX, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import { useTopic } from '../../hooks/useTopic';
import { TopicCreateRequest, TOPIC_STATUS } from '../../types/topic';
import { plagiarismService } from '../../services/plagiarismService';
import { useAuth } from '../../hooks/useAuth';
import { accountService, Account } from '../../services/accountService';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const SCHOOL_NAME = 'TRƯỜNG ĐẠI HỌC FPT';
const FORM_TITLE = 'ĐĂNG KÝ ĐỀ TÀI';

type Member = { 
  accountId: number;
  fullName: string; 
  email: string; 
  note?: string;
};

interface TopicFormValues {
  docDate?: Dayjs;
  title: string;
  description: string;
}

export default function TopicUpload(): JSX.Element {
  const router = useRouter();
  const [form] = Form.useForm<TopicFormValues>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberDrafts, setMemberDrafts] = useState<Member[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [downloadFormat, setDownloadFormat] = useState<'docx' | 'pdf'>('docx');

  const { createTopic, createLoading } = useTopic();
  const { userInfo } = useAuth();

  React.useEffect(() => {
    form.setFieldsValue({ docDate: dayjs() });
  }, [form]);

  const docDate = Form.useWatch('docDate', form);

  const formattedDocDateForHeader = useMemo(() => {
    const d = docDate ? dayjs(docDate) : dayjs();
    return `Ngày ${d.date()} tháng ${d.month() + 1} năm ${d.year()}`;
  }, [docDate]);

  const handleSubmit = async (values: TopicFormValues): Promise<void> => {
    const loadingMessage = message.loading('Đang tạo đề tài...', 0);
    
    try {
      // Lấy thông tin chủ nhiệm từ user đang đăng nhập
      const piFullName = userInfo?.name || 'N/A';
      const piLecturerId = userInfo?.lecturerId || userInfo?.employeeId || userInfo?.id?.toString() || 'N/A';
      
      const membersText =
        members.length > 0
          ? `\n\nThành viên:\n${members
              .map((m, i) => `${i + 1}. ${m.fullName} - ${m.email}${m.note ? ` (${m.note})` : ''}`)
              .join('\n')}`
          : '\n\nThành viên: (trống)';

      const piText = `Chủ nhiệm: ${piFullName} - ${piLecturerId}`;
      const headerText = `[${SCHOOL_NAME} | ${formattedDocDateForHeader}]`;

      const descriptionWithKeywords =
        `${headerText}\n${piText}\n\n${values.description}` +
        membersText;

      const topicData: TopicCreateRequest = {
        title: values.title,
        description: descriptionWithKeywords,
        status: TOPIC_STATUS.PENDING,
        submitedAt: undefined,    // removed from UI per request
        filePathUrl: '',          // removed from UI per request
      } as TopicCreateRequest;

      // Bước 1: Tạo topic
      const newTopic = await createTopic(topicData);

      if (newTopic && newTopic.id) {
        loadingMessage();
        message.success('Tạo đề tài thành công!');
        
        // Bước 2: Generate file DOCX và gửi đến plagiarism check
        try {
          const plagiarismLoadingMsg = message.loading('Đang tạo file và kiểm tra đạo văn...', 0);
          
          // Generate file DOCX
          const d = values.docDate ? dayjs(values.docDate) : dayjs();
          const docDateStr = `Ngày ${d.date()} tháng ${d.month() + 1} năm ${d.year()}`;
          
          console.log('Generating file for topic:', newTopic.id);
          
          const fileResponse = await fetch('/api/generate-topic-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              docDateStr,
              university: SCHOOL_NAME,
              formTitle: FORM_TITLE,
              topicTitle: values.title,
              piFullName,
              piLecturerId,
              description: values.description,
              members,
              format: 'docx',
            }),
          });

          console.log('File generation response status:', fileResponse.status);

          if (fileResponse.ok) {
            const blob = await fileResponse.blob();
            console.log('Generated blob size:', blob.size, 'bytes');
            
            if (blob.size === 0) {
              throw new Error('Generated file is empty');
            }

            const file = new File([blob], `de_tai_${newTopic.id}.docx`, {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            
            console.log('Created file object:', {
              name: file.name,
              size: file.size,
              type: file.type
            });

            // Gửi file đến plagiarism check
            console.log('Sending file to plagiarism check...');
            const result = await plagiarismService.checkPlagiarism(file, newTopic.id);
            console.log('Plagiarism check result:', result);
            
            plagiarismLoadingMsg();
            message.success('Đã gửi file kiểm tra đạo văn thành công!');
          } else {
            const errorText = await fileResponse.text();
            console.error('Failed to generate file:', fileResponse.status, errorText);
            plagiarismLoadingMsg();
            message.warning('Đã tạo đề tài nhưng không thể tạo file kiểm tra đạo văn');
          }
        } catch (plagiarismError) {
          console.error('Error during plagiarism check:', plagiarismError);
          message.warning('Đã tạo đề tài nhưng lỗi khi kiểm tra đạo văn');
        }

        // Reset form và chuyển trang
        form.resetFields();
        setMembers([]);
        setTimeout(() => router.push('/topics/list'), 1500);
      }
    } catch (error) {
      loadingMessage();
      console.error('Error creating topic:', error);
      message.error('Không thể tạo đề tài');
    }
  };

  // Members modal handlers
  const openMemberModal = async () => {
    setLoadingAccounts(true);
    setMemberModalOpen(true);
    
    try {
      const accounts = await accountService.getAllAccounts();
      setAvailableAccounts(accounts);
      setMemberDrafts([...members, { accountId: 0, fullName: '', email: '', note: '' }]); // auto add new row when opening
    } catch (error) {
      console.error('Error loading accounts:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoadingAccounts(false);
    }
  };
  
  const confirmMembers = () => {
    setMembers(memberDrafts.filter((m) => m.fullName || m.email));
    setMemberModalOpen(false);
  };
  
  const addMemberDraft = () => setMemberDrafts((prev) => [...prev, { accountId: 0, fullName: '', email: '', note: '' }]);
  
  const updateMemberDraft = (idx: number, key: keyof Member, value: string | number) => {
    setMemberDrafts((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], [key]: value };
      return clone;
    });
  };
  
  const handleSelectAccount = (idx: number, accountId: number) => {
    const selectedAccount = availableAccounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      setMemberDrafts((prev) => {
        const clone = [...prev];
        clone[idx] = {
          ...clone[idx],
          accountId: selectedAccount.id,
          fullName: selectedAccount.name,
          email: selectedAccount.email,
        };
        return clone;
      });
    }
  };
  
  const removeMemberDraft = (idx: number) => setMemberDrafts((prev) => prev.filter((_, i) => i !== idx));

  const removeMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx));
    message.success('Đã xóa thành viên');
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', width: 80, align: 'center' as const, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: 'Họ và tên', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email', width: 250 },
    { title: 'Ghi chú', dataIndex: 'note' },
    { 
      title: 'Thao tác', 
      dataIndex: 'actions', 
      width: 100, 
      align: 'center' as const, 
      render: (_: any, __: any, idx: number) => (
        <Button 
          type="text" 
          danger 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={() => removeMember(idx)}
        >
          Xóa
        </Button>
      )
    },
  ];

  const handleExportFile = async () => {
    try {
      const v = await form.validateFields(['docDate', 'title', 'description']);
      const d = v.docDate ? dayjs(v.docDate) : dayjs();
      const docDateStr = `Ngày ${d.date()} tháng ${d.month() + 1} năm ${d.year()}`;
      
      // Lấy thông tin chủ nhiệm từ user đang đăng nhập
      const piFullName = userInfo?.name || 'N/A';
      const piLecturerId = userInfo?.lecturerId || userInfo?.employeeId || userInfo?.id?.toString() || 'N/A';

      const res = await fetch('/api/generate-topic-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docDateStr,
          university: SCHOOL_NAME,
          formTitle: FORM_TITLE,
          topicTitle: v.title,
          piFullName,
          piLecturerId,
          description: v.description,
          members,
          format: downloadFormat,
        }),
      });

      if (!res.ok) {
        message.error('Xuất file thất bại');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dang_ky_de_tai.${downloadFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Vui lòng điền đủ thông tin trước khi xuất file');
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header banner */}
          <Card className="mb-6 rounded-2xl" styles={{ body: { padding: '32px 20px' } }}>
            <Row justify="space-between" align="top">
              <Col span={12} style={{ textAlign: 'left' }}>
                <Space direction="vertical" size={2}>
                  <Text strong style={{ fontSize: '13px', letterSpacing: 0.5 }}>
                    BỘ GIÁO DỤC VÀ ĐÀO TẠO
                  </Text>
                  <Text strong style={{ fontSize: '13px', letterSpacing: 0.5 }}>
                    TRƯỜNG ĐẠI HỌC FPT
                  </Text>
                </Space>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Space direction="vertical" size={2}>
                  <Text strong style={{ fontSize: '13px', letterSpacing: 0.5 }}>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </Text>
                  <Text strong style={{ fontSize: '13px', letterSpacing: 0.3 }}>
                    Độc lập - Tự do - Hạnh phúc
                  </Text>
                  <Divider style={{ margin: '8px 0', borderColor: '#000', borderWidth: 1.5 }} />
                </Space>
              </Col>
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Title level={2} style={{ margin: 0, letterSpacing: 2, fontSize: '24px', fontWeight: 700 }}>
                {FORM_TITLE}
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', marginTop: '8px', display: 'block' }}>
                {formattedDocDateForHeader}
              </Text>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <Spin spinning={createLoading} tip="Đang xử lý...">
              <Form<TopicFormValues> form={form} layout="vertical" onFinish={handleSubmit} size="large" disabled={createLoading}>
                <Card size="small" className="mb-6 rounded-xl" title={<Space><UserOutlined /> Thông tin chủ nhiệm & đề tài</Space>}>
                  <Row gutter={24} className="mb-4">
                    <Col xs={24}>
                      <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
                        <Space direction="vertical" size={4}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Chủ nhiệm đề tài (tự động lấy từ tài khoản đang đăng nhập)</Text>
                          <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <Text strong>{userInfo?.name || 'Đang tải...'}</Text>
                            <Divider type="vertical" />
                            <IdcardOutlined style={{ color: '#1890ff' }} />
                            <Text>{userInfo?.lecturerId || userInfo?.employeeId || userInfo?.id || 'N/A'}</Text>
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col xs={24} lg={16}>
                      <Form.Item label={<Space><BookOutlined /><Text strong>Tên đề tài</Text></Space>} name="title" rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}>
                        <Input placeholder="Nhập tên đề tài..." maxLength={200} showCount />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card size="small" className="mb-6 rounded-xl" title={<Space><FileOutlined /> Mô tả đề tài</Space>}>
                  <Form.Item label={<Text strong>Mô tả đề tài</Text>} name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}>
                    <Input.TextArea rows={10} placeholder="Mô tả chi tiết về đề tài..." maxLength={4000} showCount style={{ resize: 'vertical' }} />
                  </Form.Item>
                </Card>

                <Card 
                  size="small" 
                  className="mb-6 rounded-xl" 
                  title={
                    <Space>
                      <TeamOutlined style={{ color: '#1890ff' }} />
                      <Text strong>Danh sách giảng viên tham gia</Text>
                    </Space>
                  }
                >
                  {members.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      background: '#fafafa',
                      borderRadius: '8px',
                      border: '1px dashed #d9d9d9'
                    }}>
                      <TeamOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                      <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                        Chưa có thành viên tham gia đề tài
                      </Paragraph>
                      <Button 
                        type="dashed" 
                        icon={<PlusOutlined />} 
                        onClick={openMemberModal}
                        size="large"
                      >
                        Thêm thành viên đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Table 
                        size="small" 
                        bordered 
                        rowKey={(_, idx) => String(idx)} 
                        columns={columns} 
                        dataSource={members} 
                        pagination={false}
                        style={{ marginTop: '12px' }}
                      />
                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button 
                          type="dashed" 
                          icon={<PlusOutlined />} 
                          onClick={openMemberModal}
                          style={{ width: '200px' }}
                        >
                          Thêm thành viên
                        </Button>
                      </div>
                    </>
                  )}
                </Card>

                <Affix offsetBottom={12}>
                  <Card size="small" className="rounded-xl" styles={{ body: { padding: 12 } }}>
                    <Row justify="space-between" align="middle" gutter={16}>
                      <Col flex="auto">
                        <Space>
                          <Text type="secondary">Định dạng tải xuống:</Text>
                          <Select value={downloadFormat} style={{ width: 120 }} onChange={(v: 'docx' | 'pdf') => setDownloadFormat(v)}>
                            <Option value="docx">DOCX</Option>
                            <Option value="pdf">PDF</Option>
                          </Select>
                          <Button icon={<FileWordOutlined />} onClick={handleExportFile}>Xuất file</Button>
                        </Space>
                  </Col>
                  <Col>
                        <Space>
                          <Button onClick={() => { form.resetFields(); setMembers([]); }} disabled={createLoading}>Hủy</Button>
                          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={createLoading}>Đăng tải</Button>
                        </Space>
                  </Col>
                </Row>
                  </Card>
                </Affix>
              </Form>
            </Spin>
          </Card>
        </div>
      </Content>

      <Footer />

      <Modal 
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <Text strong>Quản lý thành viên tham gia</Text>
          </Space>
        } 
        open={memberModalOpen} 
        onOk={confirmMembers} 
        onCancel={() => setMemberModalOpen(false)} 
        okText="Xác nhận"
        cancelText="Hủy"
        width={700}
        centered
      >
        <Divider style={{ margin: '16px 0' }} />
        <Spin spinning={loadingAccounts} tip="Đang tải danh sách người dùng...">
          <Space direction="vertical" className="w-full" style={{ width: '100%', gap: '16px' }}>
            {memberDrafts.map((m, idx) => (
              <Card 
                key={idx} 
                size="small" 
                className="rounded-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                extra={
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />}
                    onClick={() => removeMemberDraft(idx)}
                  >
                    Xóa
                  </Button>
                }
              >
                <Space direction="vertical" className="w-full" style={{ width: '100%', gap: '12px' }}>
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong style={{ fontSize: '15px' }}>Thành viên #{idx + 1}</Text>
                  </Space>
                  <Row gutter={12}>
                    <Col span={24}>
                      <Space direction="vertical" style={{ width: '100%' }} size={4}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Chọn người dùng</Text>
                        <Select
                          showSearch
                          value={m.accountId || undefined}
                          onChange={(value) => handleSelectAccount(idx, value)}
                          placeholder="Tìm và chọn người dùng..."
                          style={{ width: '100%' }}
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            const children = option?.children as any;
                            if (typeof children === 'string') {
                              return children.toLowerCase().includes(input.toLowerCase());
                            }
                            return false;
                          }}
                        >
                          {availableAccounts.map((account) => (
                            <Option key={account.id} value={account.id}>
                              <Space>
                                <UserOutlined />
                                <Text>{account.name}</Text>
                                <Text type="secondary">({account.email})</Text>
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                  </Row>
                  {m.accountId > 0 && (
                    <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                          <UserOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{m.fullName}</Text>
                        </Space>
                        <Space>
                          <IdcardOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">{m.email}</Text>
                        </Space>
                      </Space>
                    </Card>
                  )}
                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Ghi chú (tùy chọn)</Text>
                    <Input.TextArea 
                      value={m.note} 
                      onChange={(e) => updateMemberDraft(idx, 'note', e.target.value)} 
                      placeholder="Thêm ghi chú nếu cần..." 
                      rows={2} 
                      maxLength={200} 
                      showCount
                      style={{ resize: 'none' }}
                    />
                  </Space>
                </Space>
              </Card>
            ))}
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={addMemberDraft}
              block
              style={{ height: '42px', fontSize: '15px' }}
            >
              Thêm thành viên mới
            </Button>
          </Space>
        </Spin>
      </Modal>
    </Layout>
  );
}