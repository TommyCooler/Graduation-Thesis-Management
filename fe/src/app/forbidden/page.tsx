'use client';
import Link from 'next/link';
import { Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-300 text-white p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-[120px] font-extrabold leading-none drop-shadow-lg">403</h1>
        <h2 className="text-3xl font-bold mb-4">Truy cập bị từ chối</h2>
        <p className="text-lg text-white/90 mb-8">
          Xin lỗi, bạn không có quyền truy cập vào trang này.<br />
          Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.
        </p>

        <Link href="/" passHref>
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            className="!bg-white !text-orange-600 font-semibold px-8 py-6 rounded-2xl hover:!bg-orange-100 transition-all duration-300"
          >
            Quay lại Trang chủ
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-8 text-white/70 text-sm">
        © {new Date().getFullYear()} FPT Education — All rights reserved.
      </div>
    </div>
  );
}
