'use client';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space, 
  Row, 
  Col, 
  message,
  Tag,
  Divider,
  Spin,
  DatePicker
} from 'antd';
import { 
  FileOutlined, 
  SaveOutlined, 
  SendOutlined,
  PlusOutlined
} from '@ant-design/icons';
import React, { JSX, useState } from 'react';
import Header from '../../components/combination/Header';
import Footer from '../../components/combination/Footer';
import { useTopic } from '../../hooks/useTopic';
import { TopicCreateRequest, TOPIC_STATUS } from '../../types/topic';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TopicFormValues {
  title: string;
  description: string;
  submitedAt?: any;
  status?: string;
  filePathUrl?: string;
}

export default function TopicUpload(): JSX.Element {
  const [form] = Form.useForm<TopicFormValues>();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputKeyword, setInputKeyword] = useState<string>('');
  
  // Use topic hook for API integration
  const { createTopic, createLoading } = useTopic();

  const handleSubmit = async (values: TopicFormValues): Promise<void> => {
    try {
      const descriptionWithKeywords = values.description + (keywords.length ? `\n\nTừ khóa: ${keywords.join(', ')}` : '');

      const topicData: TopicCreateRequest = {
        title: values.title,
        description: descriptionWithKeywords,
        status: TOPIC_STATUS.PENDING, // Luôn là PENDING khi đăng tải
        submitedAt: values.submitedAt
          ? (typeof values.submitedAt.toISOString === 'function'
              ? values.submitedAt.toISOString()
              : new Date(values.submitedAt).toISOString())
          : new Date().toISOString(), // Tự động lấy thời gian hiện tại nếu không có
        filePathUrl: values.filePathUrl || '',
      };

      const newTopic = await createTopic(topicData);

      if (newTopic) {
        message.success('Tạo đề tài thành công');
        form.resetFields();
        setKeywords([]);
        setInputKeyword('');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      message.error('Không thể tạo đề tài');
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    try {
      const values = await form.validateFields(['title', 'description']);
      const descriptionWithKeywords = (values.description as string) + (keywords.length ? `\n\nTừ khóa: ${keywords.join(', ')}` : '');

      const topicData: TopicCreateRequest = {
        title: values.title as string,
        description: descriptionWithKeywords,
        status: TOPIC_STATUS.DRAFT,
        submitedAt: undefined,
        filePathUrl: ''
      };

      const newTopic = await createTopic(topicData);
      if (newTopic) {
        message.success('Đã lưu nháp thành công!');
        form.resetFields();
        setKeywords([]);
        setInputKeyword('');
      }
    } catch (error) {
console.error('Error saving draft:', error);
      message.error('Lưu nháp thất bại');
    }
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

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content className="p-10 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <Title level={2} className="text-orange-500 mb-2">
              <FileOutlined /> Đăng tải đề tài mới
            </Title>
            <Paragraph className="text-base text-gray-600">
              Điền thông tin để tạo đề tài mới. Đề tài sẽ được nộp với trạng thái PENDING.
            </Paragraph>
          </div>

          <Card className="rounded-xl shadow-lg">
            <Spin spinning={createLoading} tip="Đang xử lý...">
              <Form<TopicFormValues>
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                disabled={createLoading}
              >
                <Row gutter={24}>
                  <Col xs={24} lg={16}>
                    <Form.Item
                      label={<Text strong>Tên đề tài</Text>}
                      name="title"
                      rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                    >
                      <Input placeholder="Nhập tên đề tài..." maxLength={200} showCount />
                    </Form.Item>

                    <Form.Item
                      label={<Text strong>Mô tả đề tài</Text>}
                      name="description"
                      rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}
                    >
                      <TextArea rows={6} placeholder="Mô tả chi tiết..." maxLength={2000} showCount />
                    </Form.Item>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Form.Item label={<Text strong>Ngày nộp (submitedAt)</Text>} name="submitedAt">
                      <DatePicker showTime className="w-full" />
                    </Form.Item>
                    <Form.Item label={<Text strong>File path URL</Text>} name="filePathUrl">
                      <Input placeholder="Đường dẫn file (nếu có)" />
                    </Form.Item>

                    <Form.Item label={<Text strong>Từ khóa</Text>}>
                      <Space direction="vertical" className="w-full">
                        <Space.Compact className="w-full">
                          <Input
                            value={inputKeyword}
                            onChange={(e) => setInputKeyword(e.target.value)}
                            placeholder="Nhập từ khóa..."
                            onPressEnter={addKeyword}
                            maxLength={30}
                          />
                          <Button type="primary" icon={<PlusOutlined />} onClick={addKeyword} disabled={!inputKeyword || keywords.length >= 10} />
                        </Space.Compact>

                        <div>
                          {keywords.map((keyword, idx) => (
                            <Tag key={idx} closable onClose={() => removeKeyword(keyword)}>
                              {keyword}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Row justify="end" gutter={16}>
                  <Col>
                    <Button size="large" onClick={() => { form.resetFields(); setKeywords([]); setInputKeyword(''); }} disabled={createLoading}>
                      Hủy
                    </Button>
                  </Col>
                  <Col>
                    <Button type="default" size="large" icon={<SaveOutlined />} onClick={handleSaveDraft} loading={createLoading}>
                      Lưu nháp
                    </Button>
                  </Col>
                  <Col>
                    <Button type="primary" size="large" htmlType="submit" icon={<SendOutlined />} loading={createLoading}>
                      Đăng tải
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Spin>
          </Card>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}