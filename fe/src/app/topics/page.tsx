'use client';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Select, 
  DatePicker, 
  Typography, 
  Space, 
  Row, 
  Col, 
  message,
  Tag,
  Divider,
  UploadFile,
  UploadProps
} from 'antd';
import { 
  UploadOutlined, 
  FileOutlined, 
  SaveOutlined, 
  SendOutlined,
  PlusOutlined
} from '@ant-design/icons';
import React, { JSX, useState } from 'react';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TopicFormValues {
  title: string;
  description: string;
  requirements: string;
  expected_results?: string;
  field: string;
  student_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  registration_deadline: dayjs.Dayjs;
}

export default function TopicUpload(): JSX.Element {
  const [form] = Form.useForm<TopicFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeyword, setInputKeyword] = useState<string>('');

  const handleSubmit = async (values: TopicFormValues): Promise<void> => {
    try {
      console.log('Topic data:', {
        ...values,
        keywords,
        attachments: fileList,
        registration_deadline: values.registration_deadline?.format('YYYY-MM-DD')
      });
      message.success('Đề tài đã được tạo thành công!');
      form.resetFields();
      setFileList([]);
      setKeywords([]);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo đề tài!');
    }
  };

  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const addKeyword = (): void => {
    if (inputKeyword && !keywords.includes(inputKeyword)) {
      setKeywords([...keywords, inputKeyword]);
      setInputKeyword('');
    }
  };

  const removeKeyword = (keyword: string): void => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const uploadProps: UploadProps = {
    fileList,
    onChange: handleFileChange,
    beforeUpload: () => false, // Prevent auto upload
    multiple: true,
    accept: '.pdf,.doc,.docx,.txt',
    maxCount: 5
  };

  const disabledDate: DatePickerProps['disabledDate'] = (current) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day');
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content style={{ padding: '40px 24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Title level={2} style={{ color: '#ff6b35', marginBottom: '8px' }}>
              <FileOutlined /> Đăng tải đề tài mới
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Tạo và đăng tải đề tài luận văn tốt nghiệp cho sinh viên
            </Paragraph>
          </div>

          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Form<TopicFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Row gutter={24}>
                {/* Left Column */}
                <Col xs={24} lg={14}>
                  <Form.Item
                    label={<Text strong>Tên đề tài</Text>}
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                  >
                    <Input 
                      placeholder="Nhập tên đề tài luận văn..."
                      style={{ borderRadius: '8px' }}
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Mô tả đề tài</Text>}
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi nghiên cứu..."
                      style={{ borderRadius: '8px' }}
                      maxLength={1000}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Yêu cầu</Text>}
                    name="requirements"
                    rules={[{ required: true, message: 'Vui lòng nhập yêu cầu!' }]}
                  >
                    <TextArea 
                      rows={3}
                      placeholder="Các yêu cầu cần thiết đối với sinh viên thực hiện đề tài..."
                      style={{ borderRadius: '8px' }}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Kết quả mong đợi</Text>}
                    name="expected_results"
                  >
                    <TextArea 
                      rows={3}
                      placeholder="Các kết quả, sản phẩm mong đợi từ đề tài..."
                      style={{ borderRadius: '8px' }}
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={10}>
                  <Form.Item
                    label={<Text strong>Lĩnh vực</Text>}
                    name="field"
                    rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực!' }]}
                  >
                    <Select 
                      placeholder="Chọn lĩnh vực nghiên cứu"
                      style={{ borderRadius: '8px' }}
                    >
                      <Option value="web-development">Web Development</Option>
                      <Option value="mobile-app">Mobile Application</Option>
                      <Option value="ai-ml">AI & Machine Learning</Option>
                      <Option value="data-science">Data Science</Option>
                      <Option value="cybersecurity">Cybersecurity</Option>
                      <Option value="iot">Internet of Things</Option>
                      <Option value="blockchain">Blockchain</Option>
                      <Option value="game-development">Game Development</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Số lượng sinh viên</Text>}
                    name="student_limit"
                    rules={[{ required: true, message: 'Vui lòng chọn số lượng sinh viên!' }]}
                  >
                    <Select 
                      placeholder="Chọn số lượng sinh viên"
                      style={{ borderRadius: '8px' }}
                    >
                      <Option value={1}>1 sinh viên</Option>
                      <Option value={2}>2 sinh viên</Option>
                      <Option value={3}>3 sinh viên</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Mức độ khó</Text>}
                    name="difficulty"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
                  >
                    <Select 
                      placeholder="Chọn mức độ khó"
                      style={{ borderRadius: '8px' }}
                    >
                      <Option value="easy">Dễ</Option>
                      <Option value="medium">Trung bình</Option>
                      <Option value="hard">Khó</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<Text strong>Hạn đăng ký</Text>}
                    name="registration_deadline"
                    rules={[{ required: true, message: 'Vui lòng chọn hạn đăng ký!' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%', borderRadius: '8px' }}
                      placeholder="Chọn ngày hết hạn đăng ký"
                      format="DD/MM/YYYY"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>

                  {/* Keywords Section */}
                  <Form.Item label={<Text strong>Từ khóa</Text>}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          value={inputKeyword}
                          onChange={(e) => setInputKeyword(e.target.value)}
                          placeholder="Nhập từ khóa..."
                          onPressEnter={addKeyword}
                          maxLength={20}
                        />
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={addKeyword}
                          style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                          disabled={!inputKeyword || keywords.length >= 10}
                        />
                      </Space.Compact>
                      
                      <div style={{ minHeight: '32px' }}>
                        {keywords.map((keyword: string, index: number) => (
                          <Tag
                            key={index}
                            closable
                            onClose={() => removeKeyword(keyword)}
                            style={{ 
                              marginBottom: '8px',
                              background: '#fff5f0',
                              color: '#ff6b35',
                              border: '1px solid #ff6b35'
                            }}
                          >
                            {keyword}
                          </Tag>
                        ))}
                      </div>
                      {keywords.length >= 10 && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Tối đa 10 từ khóa
                        </Text>
                      )}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* File Upload Section */}
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={<Text strong>Tài liệu đính kèm</Text>}
                  >
                    <Upload.Dragger 
                      {...uploadProps}
                      style={{ borderRadius: '8px' }}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ color: '#ff6b35', fontSize: '48px' }} />
                      </p>
                      <p className="ant-upload-text">
                        Kéo thả file vào đây hoặc click để chọn file
                      </p>
                      <p className="ant-upload-hint">
                        Hỗ trợ: PDF, DOC, DOCX, TXT (Tối đa 10MB mỗi file, tối đa 5 files)
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Action Buttons */}
              <Row justify="end" gutter={16}>
                <Col>
                  <Button 
                    size="large"
                    style={{ borderRadius: '8px', minWidth: '120px' }}
                    onClick={() => {
                      form.resetFields();
                      setFileList([]);
                      setKeywords([]);
                    }}
                  >
                    Hủy
                  </Button>
                </Col>
                <Col>
                  <Button 
                    type="default"
                    size="large"
                    icon={<SaveOutlined />}
                    style={{ 
                      borderRadius: '8px', 
                      minWidth: '120px',
                      color: '#ff6b35',
                      borderColor: '#ff6b35'
                    }}
                    onClick={() => {
                      // Save as draft logic
                      message.info('Đã lưu nháp');
                    }}
                  >
                    Lưu nháp
                  </Button>
                </Col>
                <Col>
                  <Button 
                    type="primary"
                    size="large"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    style={{ 
                      background: '#ff6b35', 
                      borderColor: '#ff6b35',
                      borderRadius: '8px',
                      minWidth: '120px'
                    }}
                  >
                    Đăng tải
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Help Section */}
          <Card 
            style={{ 
              marginTop: '24px', 
              borderRadius: '12px', 
              background: '#fff5f0',
              border: '1px solid #ff6b35'
            }}
          >
            <Title level={4} style={{ color: '#ff6b35', marginBottom: '16px' }}>
              💡 Hướng dẫn tạo đề tài
            </Title>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <ul style={{ color: '#666', lineHeight: 1.8 }}>
                  <li>Tên đề tài nên rõ ràng, cụ thể và không quá dài</li>
                  <li>Mô tả chi tiết về mục tiêu và phạm vi nghiên cứu</li>
                  <li>Nêu rõ yêu cầu kỹ năng, kiến thức cần thiết</li>
                  <li>Đính kèm tài liệu tham khảo nếu có</li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <ul style={{ color: '#666', lineHeight: 1.8 }}>
                  <li>Chọn từ khóa phù hợp để sinh viên dễ tìm kiếm</li>
                  <li>Đặt hạn đăng ký hợp lý (ít nhất 1 tuần)</li>
                  <li>Xem xét kỹ số lượng sinh viên phù hợp</li>
                  <li>Đánh giá mức độ khó phù hợp với sinh viên</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}