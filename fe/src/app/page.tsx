'use client';
import { Layout, Card, Row, Col, Typography, Divider } from 'antd';
import { CheckCircleOutlined, SearchOutlined, SafetyOutlined } from '@ant-design/icons';
import Header from '../components/combination/Header';
import Footer from '../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-50 to-white py-20 px-6 text-center">
          <div className="max-w-6xl mx-auto">
            <Title level={1} className="text-6xl mb-6">
              Quản lý <span className="text-orange-500">luận văn</span> <span className="text-orange-500">tốt nghiệp</span>
            </Title>
            <Paragraph className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto">
              Nền tảng chuyên nghiệp dành cho giảng viên và trưởng môn học để duyệt đề tài đồ án tốt nghiệp 
              và kiểm tra tính nguyên bản của nội dung nghiên cứu.
            </Paragraph>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <Title level={2} className="text-center mb-15">
              Tính năng chính
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Duyệt đề tài
                  </Title>
                  <Paragraph className="text-gray-600">
                    Xem xét, đánh giá và phê duyệt đề tài đồ án tốt nghiệp của sinh viên
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Kiểm tra đạo văn
                  </Title>
                  <Paragraph className="text-gray-600">
                    Sử dụng công nghệ AI để phát hiện và kiểm tra tính nguyên bản của nội dung
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  className="text-center h-full"
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SafetyOutlined className="text-3xl text-orange-500" />
                  </div>
                  <Title level={4} className="mb-4">
                    Quản lý quy trình
                  </Title>
                  <Paragraph className="text-gray-600">
                    Theo dõi và quản lý toàn bộ quy trình từ nộp đề tài đến phê duyệt cuối cùng
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>


        {/* Process Section */}
        <div className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <Title level={2} className="text-center mb-15">
              Quy trình làm việc
            </Title>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <div className="bg-white p-10 rounded-lg shadow-md">
                  <Title level={4} className="text-orange-500 mb-5">
                    Cho Giảng viên:
                  </Title>
                  <ul className="text-base leading-8 text-gray-600">
                    <li>Nhận thông báo đề tài mới cần duyệt</li>
                    <li>Xem xét nội dung và tính khả thi</li>
                    <li>Kiểm tra đạo văn tự động</li>
                    <li>Đưa ra ý kiến và quyết định phê duyệt</li>
                  </ul>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="bg-white p-10 rounded-lg shadow-md">
                  <Title level={4} className="text-orange-500 mb-5">
                    Cho Trưởng môn:
                  </Title>
                  <ul className="text-base leading-8 text-gray-600">
                    <li>Giám sát tổng thể quy trình duyệt</li>
                    <li>Xử lý các trường hợp phức tạp</li>
                    <li>Thống kê và báo cáo hiệu suất</li>
                    <li>Phê duyệt cuối cùng các đề tài quan trọng</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      <Divider className="my-0" />
      <Footer />
    </Layout>
  );
}
