'use client';
import { Layout, Card, Row, Col, Statistic, Button, Typography, Space } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  AuditOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text: AntText } = Typography;

export default function HeadOfDepartmentDashboard() {
  // Mock data - sẽ thay thế bằng API call thực tế
  const stats = {
    totalTheses: 45,
    pendingReview: 12,
    approved: 28,
    rejected: 5
  };

  const recentTheses = [
    {
      id: 1,
      title: "Hệ thống quản lý thư viện số sử dụng AI",
      student: "Nguyễn Văn A",
      supervisor: "ThS. Trần Thị B",
      status: "pending",
      submittedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Ứng dụng blockchain trong quản lý chuỗi cung ứng",
      student: "Lê Văn C",
      supervisor: "TS. Phạm Thị D",
      status: "approved",
      submittedDate: "2024-01-14"
    },
    {
      id: 3,
      title: "Phát triển ứng dụng IoT cho nông nghiệp thông minh",
      student: "Hoàng Thị E",
      supervisor: "ThS. Nguyễn Văn F",
      status: "pending",
      submittedDate: "2024-01-13"
    }
  ];

  return (
    <Layout className="min-h-screen">
      <Header />
      
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Welcome Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
            padding: '32px',
            borderRadius: '12px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#ff6b35' }}>
                  Chào mừng, Trưởng bộ môn!
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#666', margin: '8px 0 0' }}>
                  Quản lý và duyệt đề tài khóa luận tốt nghiệp
                </Paragraph>
              </div>
              <div style={{
                width: 80,
                height: 80,
                background: '#fff5f0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AuditOutlined style={{ fontSize: '40px', color: '#ff6b35' }} />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đề tài"
                  value={stats.totalTheses}
                  prefix={<FileTextOutlined style={{ color: '#ff6b35' }} />}
                  valueStyle={{ color: '#ff6b35' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Chờ duyệt"
                  value={stats.pendingReview}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đã duyệt"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Từ chối"
                  value={stats.rejected}
                  prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} md={12}>
              <Card 
                title="Thao tác nhanh"
                extra={<BarChartOutlined style={{ color: '#ff6b35' }} />}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Link href="/head-of-department/thesis-review">
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ 
                        width: '100%',
                        background: '#ff6b35',
                        borderColor: '#ff6b35',
                        height: '48px'
                      }}
                      icon={<AuditOutlined />}
                    >
                      Duyệt đề tài ({stats.pendingReview})
                    </Button>
                  </Link>
                  
                  <Button 
                    size="large" 
                    style={{ 
                      width: '100%',
                      color: '#ff6b35',
                      borderColor: '#ff6b35',
                      height: '48px'
                    }}
                    icon={<BarChartOutlined />}
                  >
                    Xem báo cáo thống kê
                  </Button>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card 
                title="Đề tài gần đây"
                extra={<FileTextOutlined style={{ color: '#ff6b35' }} />}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {recentTheses.map((thesis) => (
                    <div key={thesis.id} style={{
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      border: '1px solid #e8e8e8'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Paragraph 
                            style={{ 
                              margin: 0, 
                              fontWeight: 'bold',
                              fontSize: '14px',
                              marginBottom: '4px'
                            }}
                            ellipsis={{ rows: 2 }}
                          >
                            {thesis.title}
                          </Paragraph>
                          <AntText type="secondary" style={{ fontSize: '12px' }}>
                            SV: {thesis.student} | GVHD: {thesis.supervisor}
                          </AntText>
                        </div>
                        <div style={{ marginLeft: '12px', textAlign: 'right' }}>
                          <div style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: thesis.status === 'approved' ? '#f6ffed' : '#fff7e6',
                            color: thesis.status === 'approved' ? '#52c41a' : '#faad14'
                          }}>
                            {thesis.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </div>
                          <AntText type="secondary" style={{ fontSize: '11px' }}>
                            {thesis.submittedDate}
                          </AntText>
                        </div>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Progress Overview */}
          <Card title="Tổng quan tiến độ">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#ff6b35 0deg 252deg, #e8e8e8 252deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#ff6b35'
                    }}>
                      70%
                    </div>
                  </div>
                  <Title level={4} style={{ margin: 0 }}>Tỷ lệ hoàn thành</Title>
                  <AntText type="secondary">28/40 đề tài đã được duyệt</AntText>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#52c41a 0deg 180deg, #e8e8e8 180deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#52c41a'
                    }}>
                      50%
                    </div>
                  </div>
                  <Title level={4} style={{ margin: 0 }}>Tỷ lệ duyệt</Title>
                  <AntText type="secondary">28/56 đề tài được duyệt</AntText>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#faad14 0deg 72deg, #e8e8e8 72deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#faad14'
                    }}>
                      20%
                    </div>
                  </div>
                  <Title level={4} style={{ margin: 0 }}>Chờ xử lý</Title>
                  <AntText type="secondary">12/60 đề tài chờ duyệt</AntText>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}
