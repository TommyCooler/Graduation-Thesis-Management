'use client';
import { useEffect, useState } from 'react';
import { Layout, Button, Space, Dropdown } from 'antd';
import {
  LoginOutlined,
  UserOutlined,
  FileAddOutlined,
  SearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const { Header: AntHeader } = Layout;

type Claims = {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

export default function Header() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claims | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setClaims(null);
      return;
    }
    try {
      const decoded = jwtDecode<Claims>(token);
      setClaims(decoded);
    } catch {
      setClaims(null);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    setClaims(null);
    router.push('/auth/login');
  };

  const menu = {
    items: [
      { key: 'profile', label: <Link href="/profile">Hồ sơ</Link>, icon: <UserOutlined /> },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: <span onClick={onLogout}>Đăng xuất</span>,
        icon: <LogoutOutlined />,
      },
    ],
  };

  return (
    <AntHeader className="bg-white border-b border-gray-200 shadow-sm px-6">
      <div className="flex justify-between items-center h-full">
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

        <div className="flex items-center space-x-6">
          {/* Navigation */}
          <nav className="hidden lg:flex space-x-4">
            <Link href="/topics">
              <Button type="text" icon={<FileAddOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                Đăng tải đề tài
              </Button>
            </Link>
            <Link href="/check-plagiarism">
              <Button type="text" icon={<SearchOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                Kiểm tra đạo văn
              </Button>
            </Link>
          </nav>

          {/* Auth section */}
          <Space>
            {!claims ? (
              <>
                <Link href="/auth/login">
                  <Button type="text" icon={<LoginOutlined />} className="text-gray-600 hover:text-orange-500">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    type="primary"
                    icon={<UserOutlined />}
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            ) : (
              <Dropdown menu={menu} placement="bottomRight" trigger={['click']}>
                <Button
                  type="primary"
                  className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                  icon={<UserOutlined />}
                >
                  {claims.name}
                </Button>
              </Dropdown>
            )}
          </Space>
        </div>
      </div>
    </AntHeader>
  );
}
