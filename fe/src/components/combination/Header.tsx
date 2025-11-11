'use client';
import { useEffect, useState } from 'react';
import { Layout, Button, Space, Dropdown } from 'antd';
import {
  LoginOutlined,
  UserOutlined,
  FileAddOutlined,
  SearchOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  HistoryOutlined,
  TeamOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const { Header: AntHeader } = Layout;

type Claims = {
  name?: string;
  email?: string;
  role?: string;
};

export default function Header() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claims | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  // Lấy user info bằng cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/account-service/api/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) {
          setClaims(null);
          return;
        }
        const data = await res.json();
        setClaims(data?.data || null);
      } catch {
        setClaims(null);
      }
    };
    fetchUser();
  }, [API_BASE]);

  const onLogout = async () => {
    await fetch(`${API_BASE}/account-service/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setClaims(null);
    router.push('/auth/login');
  };

  // Kiểm tra xem user có phải là Head of Department không
  const isHeadOfDepartment = claims?.role?.toLowerCase() === 'headofdepartment' || 
                             claims?.role?.toLowerCase() === 'head_of_department';

  const menu = {
    items: [
      { key: 'profile', label: <Link href="/profile">Hồ sơ</Link>, icon: <UserOutlined /> },
      ...(isHeadOfDepartment ? [
        { type: 'divider' as const },
        { 
          key: 'management', 
          label: <Link href="/head-of-department/dashboard">Quản lý</Link>, 
          icon: <DashboardOutlined /> 
        },
      ] : []),
      { type: 'divider' as const },
      { key: 'logout', label: <span onClick={onLogout}>Đăng xuất</span>, icon: <LogoutOutlined /> },
    ],
  };

  return (
    <AntHeader className="bg-white border-b border-gray-200 shadow-sm px-6">
      <div className="flex justify-between items-center h-full">
        <Link href="/" className="flex items-center cursor-pointer">
          <Image src="/FPT_Education_logo.svg" alt="FPT Education" width={120} height={48} className="h-12 w-auto" />
        </Link>

        <div className="flex items-center space-x-6">
          {/* Chỉ hiện navigation khi đã đăng nhập */}
          {claims && (
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
              <Link href="/topics/list">
                <Button type="text" icon={<UnorderedListOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                  Danh sách đề tài
                </Button>
              </Link>
              <Link href="/topic-history">
                <Button type="text" icon={<HistoryOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                  Lịch sử đề tài
                </Button>
              </Link>
              <Link href="/my-council">
                <Button type="text" icon={<TeamOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                  Hội đồng khóa Luận
                </Button>
              </Link>
              <Link href="/review-council">
                <Button type="text" icon={<TeamOutlined />} className="text-gray-600 h-10 px-4 hover:text-orange-500">
                  Hội đồng review
                </Button>
              </Link>
            </nav>
          )}

          <Space>
            {!claims ? (
              <>
                <Link href="/auth/login">
                  <Button type="text" icon={<LoginOutlined />} className="text-gray-600 hover:text-orange-500">
                    Đăng nhập
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
