'use client';
import { Layout, Button, Space, Typography, Menu, Dropdown } from 'antd';
import { 
  LoginOutlined, 
  UserOutlined, 
  FileAddOutlined, 
  DashboardOutlined,
  DownOutlined,
  BookOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
  const teacherMenuItems = [
    {
      key: 'create-topic',
      icon: <FileAddOutlined />,
      label: (
        <Link href="/topics">
          Đăng tải đề tài
        </Link>
      ),
    },
  ];

  return (
    <AntHeader style={{ 
      background: '#fff', 
      borderBottom: '4px solid #ff6b35',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 24px'
    }}>
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div style={{
                width: 50,
                height: 40,
                background: '#ff6b35',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>FPT</span>
              </div>
              <Title level={3} style={{ margin: 0, color: '#ff6b35' }}>
                Graduation Thesis Management
              </Title>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex space-x-6">
            <Link href="/topics">
              <Button 
                type="text" 
                icon={<FileAddOutlined />}
                style={{ color: '#666', height: '40px', padding: '0 16px' }}
              >
                Đăng tải đề tài
              </Button>
            </Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <Space>
          <Link href="/auth/login">
            <Button type="text" icon={<LoginOutlined />} style={{ color: '#666' }}>
              Đăng nhập
            </Button>
          </Link>
          <Link href="/profile">
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
            >
              Tài khoản
            </Button>
          </Link>
        </Space>
      </div>
    </AntHeader>
  );
}