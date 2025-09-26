'use client';
import { Layout, Button, Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { CheckCircleOutlined, SearchOutlined, UserOutlined, AuditOutlined, SafetyOutlined } from '@ant-design/icons';
import Link from 'next/link';
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
        <div style={{ 
          background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={1} style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
              Hệ thống <span style={{ color: '#ff6b35' }}>Duyệt đề tài</span> và <span style={{ color: '#ff6b35' }}>Kiểm tra đạo văn</span>
            </Title>
            <Paragraph style={{ fontSize: '20px', color: '#666', marginBottom: '40px', maxWidth: 800, margin: '0 auto 40px' }}>
              Nền tảng chuyên nghiệp dành cho giảng viên và trưởng môn học để duyệt đề tài đồ án tốt nghiệp 
              và kiểm tra tính nguyên bản của nội dung nghiên cứu.
            </Paragraph>
            <Space size="large">
              <Link href="/teacher/dashboard">
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ 
                    background: '#ff6b35', 
                    borderColor: '#ff6b35',
                    height: '50px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                  icon={<UserOutlined />}
                >
                  Dành cho Giảng viên
                </Button>
              </Link>
              <Link href="/head-of-department/dashboard">
                <Button 
                  size="large" 
                  style={{ 
                    color: '#ff6b35',
                    borderColor: '#ff6b35',
                    height: '50px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                  icon={<AuditOutlined />}
                >
                  Dành cho Trưởng môn
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>
              Tính năng chính
            </Title>
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div style={{
                    width: 64,
                    height: 64,
                    background: '#fff5f0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
                  </div>
                  <Title level={4} style={{ marginBottom: '16px' }}>
                    Duyệt đề tài
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    Xem xét, đánh giá và phê duyệt đề tài đồ án tốt nghiệp của sinh viên
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div style={{
                    width: 64,
                    height: 64,
                    background: '#fff5f0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <SearchOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
                  </div>
                  <Title level={4} style={{ marginBottom: '16px' }}>
                    Kiểm tra đạo văn
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    Sử dụng công nghệ AI để phát hiện và kiểm tra tính nguyên bản của nội dung
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card 
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <div style={{
                    width: 64,
                    height: 64,
                    background: '#fff5f0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <SafetyOutlined style={{ fontSize: '32px', color: '#ff6b35' }} />
                  </div>
                  <Title level={4} style={{ marginBottom: '16px' }}>
                    Quản lý quy trình
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    Theo dõi và quản lý toàn bộ quy trình từ nộp đề tài đến phê duyệt cuối cùng
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ padding: '80px 24px', background: '#ff6b35' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[32, 32]}>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span style={{ color: '#ffb399' }}>Đề tài đã duyệt</span>}
                  value={1250}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold' }}
                  style={{ textAlign: 'center' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span style={{ color: '#ffb399' }}>Giảng viên sử dụng</span>}
                  value={85}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold' }}
                  style={{ textAlign: 'center' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span style={{ color: '#ffb399' }}>Kiểm tra đạo văn</span>}
                  value={3200}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold' }}
                  style={{ textAlign: 'center' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span style={{ color: '#ffb399' }}>Độ chính xác</span>}
                  value={98.5}
                  suffix="%"
                  valueStyle={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold' }}
                  style={{ textAlign: 'center' }}
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Process Section */}
        <div style={{ padding: '80px 24px', background: '#f9f9f9' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>
              Quy trình làm việc
            </Title>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Title level={4} style={{ color: '#ff6b35', marginBottom: '20px' }}>
                    Cho Giảng viên:
                  </Title>
                  <ul style={{ fontSize: '16px', lineHeight: 2, color: '#666' }}>
                    <li>Nhận thông báo đề tài mới cần duyệt</li>
                    <li>Xem xét nội dung và tính khả thi</li>
                    <li>Kiểm tra đạo văn tự động</li>
                    <li>Đưa ra ý kiến và quyết định phê duyệt</li>
                  </ul>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Title level={4} style={{ color: '#ff6b35', marginBottom: '20px' }}>
                    Cho Trưởng môn:
                  </Title>
                  <ul style={{ fontSize: '16px', lineHeight: 2, color: '#666' }}>
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

      <Footer />
    </Layout>
  );
}
