'use client';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Select, 
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
        attachments: fileList
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


  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <Title level={2} className="text-orange-500 mb-2">
              <FileOutlined /> Đăng tải đề tài mới
            </Title>
            <Paragraph className="text-base text-gray-600">
              Tạo và đăng tải đề tài luận văn tốt nghiệp cho sinh viên
            </Paragraph>
          </div>

          <Card className="rounded-xl shadow-lg">
            <Form<TopicFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Row gutter={24}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                  <Form.Item
                    label={<Text strong>Tên đề tài</Text>}
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                  >
                    <Input 
                      placeholder="Nhập tên đề tài luận văn..."
                      className="rounded-lg"
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
                      className="rounded-lg"
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
                      className="rounded-lg"
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
                      className="rounded-lg"
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                  <Form.Item
                    label={<Text strong>Lĩnh vực</Text>}
                    name="field"
                    rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực!' }]}
                  >
                    <Select 
                      placeholder="Chọn lĩnh vực nghiên cứu"
                      className="rounded-lg"
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


                  {/* Keywords Section */}
                  <Form.Item label={<Text strong>Từ khóa</Text>}>
                    <Space direction="vertical" className="w-full">
                      <Space.Compact className="w-full">
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
                          className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                          disabled={!inputKeyword || keywords.length >= 10}
                        />
                      </Space.Compact>
                      
                      <div className="min-h-8">
                        {keywords.map((keyword: string, index: number) => (
                          <Tag
                            key={index}
                            closable
                            onClose={() => removeKeyword(keyword)}
                            className="mb-2 bg-orange-50 text-orange-500 border-orange-500"
                          >
                            {keyword}
                          </Tag>
                        ))}
                      </div>
                      {keywords.length >= 10 && (
                        <Text type="secondary" className="text-xs">
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
                      className="rounded-lg"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined className="text-orange-500 text-5xl" />
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
                    className="rounded-lg min-w-30"
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
                    className="rounded-lg min-w-30 text-orange-500 border-orange-500 hover:text-orange-600 hover:border-orange-600"
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
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600 rounded-lg min-w-30"
                  >
                    Đăng tải
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Help Section */}
          <Card 
            className="mt-6 rounded-xl bg-orange-50 border-orange-500"
          >
            <Title level={4} className="text-orange-500 mb-4">
              💡 Hướng dẫn tạo đề tài
            </Title>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <ul className="text-gray-600 leading-relaxed">
                  <li>Tên đề tài nên rõ ràng, cụ thể và không quá dài</li>
                  <li>Mô tả chi tiết về mục tiêu và phạm vi nghiên cứu</li>
                  <li>Nêu rõ yêu cầu kỹ năng, kiến thức cần thiết</li>
                  <li>Đính kèm tài liệu tham khảo nếu có</li>
                </ul>
              </Col>
              <Col xs={24} md={12}>
                <ul className="text-gray-600 leading-relaxed">
                  <li>Chọn từ khóa phù hợp để sinh viên dễ tìm kiếm</li>
                  <li>Mô tả chi tiết và rõ ràng về đề tài</li>
                  <li>Đính kèm tài liệu tham khảo nếu có</li>
                  <li>Kiểm tra kỹ nội dung trước khi đăng tải</li>
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