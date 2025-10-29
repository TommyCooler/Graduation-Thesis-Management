'use client';
import { Layout, Row, Col, Typography, Divider } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

export default function Footer() {
  return (
    <>
      <AntFooter className="bg-black text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6}>
            <div className="mb-5">
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/FPT_Education_logo.svg" 
                  alt="FPT Education" 
                  width={80} 
                  height={32}
                  className="!h-8 !w-auto"
                />
              </div>
              <Paragraph className="!text-white">
                Hệ thống duyệt đề tài và kiểm tra đạo văn chuyên nghiệp.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} className="!text-white !mb-5">Tính năng</Title>
            <div className="flex flex-col gap-2">
              <Link href="/features/approval" className="!text-white hover:!text-gray-300 !transition-colors">Duyệt đề tài</Link>
              <Link href="/features/plagiarism" className="!text-white hover:!text-gray-300 !transition-colors">Kiểm tra đạo văn</Link>
              <Link href="/features/analytics" className="!text-white hover:!text-gray-300 !transition-colors">Thống kê báo cáo</Link>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} className="!text-white !mb-5">Hỗ trợ</Title>
            <div className="flex flex-col gap-2">
              <Link href="/guide/teacher" className="!text-white hover:!text-gray-300 !transition-colors">Hướng dẫn giảng viên</Link>
              <Link href="/guide/head" className="!text-white hover:!text-gray-300 !transition-colors">Hướng dẫn trưởng môn</Link>
              <Link href="/contact" className="!text-white hover:!text-gray-300 !transition-colors">Liên hệ hỗ trợ</Link>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} className="!text-white !mb-5">Thông tin</Title>
            <div className="text-white leading-relaxed">
              <div>Email: support@thesis-review.edu.vn</div>
              <div>Điện thoại: (024) 123-4567</div>
              <div>Địa chỉ: FPT University</div>
            </div>
          </Col>
        </Row>
        <div className="border-t border-gray-700 mt-10 pt-5 text-center text-white">
          © 2024 Thesis Review System. All rights reserved.
        </div>
      </div>
    </AntFooter>
    </>
  );
}