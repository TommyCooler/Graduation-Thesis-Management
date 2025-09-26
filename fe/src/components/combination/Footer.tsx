'use client';
import { Layout, Row, Col, Typography } from 'antd';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

export default function Footer() {
  return (
    <AntFooter style={{ background: '#1f1f1f', color: '#fff', padding: '60px 24px 30px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div style={{
                  width: 32,
                  height: 32,
                  background: '#ff6b35',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>T</span>
                </div>
                <span style={{ fontWeight: 600 }}>Thesis Review</span>
              </div>
              <Paragraph style={{ color: '#999' }}>
                Hệ thống duyệt đề tài và kiểm tra đạo văn chuyên nghiệp.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>Tính năng</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/features/approval" style={{ color: '#999' }}>Duyệt đề tài</Link>
              <Link href="/features/plagiarism" style={{ color: '#999' }}>Kiểm tra đạo văn</Link>
              <Link href="/features/analytics" style={{ color: '#999' }}>Thống kê báo cáo</Link>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>Hỗ trợ</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/guide/teacher" style={{ color: '#999' }}>Hướng dẫn giảng viên</Link>
              <Link href="/guide/head" style={{ color: '#999' }}>Hướng dẫn trưởng môn</Link>
              <Link href="/contact" style={{ color: '#999' }}>Liên hệ hỗ trợ</Link>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>Thông tin</Title>
            <div style={{ color: '#999', lineHeight: 1.8 }}>
              <div>Email: support@thesis-review.edu.vn</div>
              <div>Điện thoại: (024) 123-4567</div>
              <div>Địa chỉ: FPT University</div>
            </div>
          </Col>
        </Row>
        <div style={{ 
          borderTop: '1px solid #333', 
          marginTop: '40px', 
          paddingTop: '20px', 
          textAlign: 'center', 
          color: '#999' 
        }}>
          © 2024 Thesis Review System. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
}