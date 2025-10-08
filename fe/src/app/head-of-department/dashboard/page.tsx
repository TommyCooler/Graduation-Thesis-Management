'use client';
import { Layout, Card, Row, Col, Statistic, Button, Typography, Space } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AuditOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Header from '../../../components/combination/Header';
import Footer from '../../../components/combination/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text: AntText } = Typography;

interface Thesis {
  id: number;
  title: string;
  student: string;
  supervisor: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export default function HeadOfDepartmentDashboard() {
  const stats = {
    totalTheses: 45,
    pendingReview: 12,
    approved: 28,
    rejected: 5,
  };

  const recentTheses: Thesis[] = [
    {
      id: 1,
      title: 'Hệ thống quản lý thư viện số sử dụng AI',
      student: 'Nguyễn Văn A',
      supervisor: 'ThS. Trần Thị B',
      status: 'pending',
      submittedDate: '2024-01-15',
    },
    {
      id: 2,
      title: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng',
      student: 'Lê Văn C',
      supervisor: 'TS. Phạm Thị D',
      status: 'approved',
      submittedDate: '2024-01-14',
    },
    {
      id: 3,
      title: 'Phát triển ứng dụng IoT cho nông nghiệp thông minh',
      student: 'Hoàng Thị E',
      supervisor: 'ThS. Nguyễn Văn F',
      status: 'pending',
      submittedDate: '2024-01-13',
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header />

      <Content className="p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-[#fff5f0] to-white p-8 rounded-xl mb-8 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <Title level={2} className="m-0 text-[#ff6b35]">
                  Chào mừng, Trưởng bộ môn!
                </Title>
                <Paragraph className="text-base text-gray-600 mt-2 mb-0">
                  Quản lý và duyệt đề tài khóa luận tốt nghiệp
                </Paragraph>
              </div>
              <div className="w-20 h-20 bg-[#fff5f0] rounded-full flex items-center justify-center">
                <AuditOutlined className="text-5xl text-[#ff6b35]" />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đề tài"
                  value={stats.totalTheses}
                  prefix={<FileTextOutlined className="text-[#ff6b35]" />}
                  valueStyle={{ color: '#ff6b35' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Chờ duyệt"
                  value={stats.pendingReview}
                  prefix={<ClockCircleOutlined className="text-yellow-500" />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đã duyệt"
                  value={stats.approved}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Từ chối"
                  value={stats.rejected}
                  prefix={<UserOutlined className="text-red-500" />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={12}>
              <Card
                title="Thao tác nhanh"
                extra={<BarChartOutlined className="text-[#ff6b35]" />}
                className="h-full"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <Link href="/head-of-department/thesis-review">
                    <Button
                      type="primary"
                      size="large"
                      className="w-full h-12 bg-[#ff6b35] border-[#ff6b35]"
                      icon={<AuditOutlined />}
                    >
                      Duyệt đề tài ({stats.pendingReview})
                    </Button>
                  </Link>

                  <Button
                    size="large"
                    className="w-full h-12 text-[#ff6b35] border-[#ff6b35]"
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
                extra={<FileTextOutlined className="text-[#ff6b35]" />}
                className="h-full"
              >
                <Space direction="vertical" size="small" className="w-full">
                  {recentTheses.map((thesis) => (
                    <div
                      key={thesis.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Paragraph
                            className="m-0 font-bold text-sm mb-1"
                            ellipsis={{ rows: 2 }}
                          >
                            {thesis.title}
                          </Paragraph>
                          <AntText type="secondary" className="text-xs">
                            SV: {thesis.student} | GVHD: {thesis.supervisor}
                          </AntText>
                        </div>
                        <div className="ml-3 text-right">
                          <div
                            className={`py-1 px-2 rounded text-xs font-bold ${
                              thesis.status === 'approved'
                                ? 'bg-green-100 text-green-500'
                                : 'bg-yellow-100 text-yellow-500'
                            }`}
                          >
                            {thesis.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </div>
                          <AntText type="secondary" className="text-[11px]">
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
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative bg-conic-gradient">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-lg font-bold text-[#ff6b35]">
                      70%
                    </div>
                  </div>
                  <Title level={4} className="m-0">
                    Tỷ lệ hoàn thành
                  </Title>
                  <AntText type="secondary">28/40 đề tài đã được duyệt</AntText>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative bg-conic-gradient-approved">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-lg font-bold text-green-500">
                      50%
                    </div>
                  </div>
                  <Title level={4} className="m-0">
                    Tỷ lệ duyệt
                  </Title>
                  <AntText type="secondary">28/56 đề tài được duyệt</AntText>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative bg-conic-gradient-pending">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-lg font-bold text-yellow-500">
                      20%
                    </div>
                  </div>
                  <Title level={4} className="m-0">
                    Chờ xử lý
                  </Title>
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