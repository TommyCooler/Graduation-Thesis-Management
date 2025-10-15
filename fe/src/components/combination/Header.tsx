'use client';
import { Layout, Button, Space } from 'antd';
import { 
  LoginOutlined, 
  UserOutlined, 
  FileAddOutlined, 
  SearchOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const { Header: AntHeader } = Layout;

export default function Header() {
  return (
    <AntHeader 
      className="bg-white border-b border-gray-200 shadow-sm px-6"
      style={{ 
        backgroundColor: '#ffffff !important',
        color: '#000000 !important'
      }}
    >
      <div 
        className="flex justify-between items-center h-full"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer">
          <Image 
            src="/FPT_Education_logo.svg" 
            alt="FPT Education" 
            width={120} 
            height={48}
            className="h-12 w-auto"
          />
        </Link>

        {/* Navigation Menu & Auth Buttons */}
        <div className="flex items-center space-x-6">
          {/* Navigation Menu */}
          <nav className="hidden lg:flex space-x-4">
            <Link href="/topics">
              <Button 
                type="text" 
                icon={<FileAddOutlined />}
                className="text-gray-600 h-10 px-4 hover:text-orange-500"
              >
                Đăng tải đề tài
              </Button>
            </Link>
            <Link href="/check-plagiarism">
              <Button 
                type="text" 
                icon={<SearchOutlined />}
                className="text-gray-600 h-10 px-4 hover:text-orange-500"
              >
                Kiểm tra đạo văn
              </Button>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <Space>
            <Link href="/auth/login">
              <Button type="text" icon={<LoginOutlined />} className="text-gray-600 hover:text-orange-500">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/profile">
              <Button 
                type="primary" 
                icon={<UserOutlined />}
                className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
              >
                Tài khoản
              </Button>
            </Link>
          </Space>
        </div>
      </div>
    </AntHeader>
  );
}