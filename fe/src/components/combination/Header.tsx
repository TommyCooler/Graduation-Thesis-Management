'use client';
import { Layout, Button, Space, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
  return (
    <AntHeader style={{ 
      background: '#fff', 
      borderBottom: '4px solid #ff6b35',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '0 24px'
    }}>
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center space-x-3">
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
        <Space>
          <Link href="/login">
            <Button type="text" icon={<LoginOutlined />} style={{ color: '#666' }}>
              Đăng nhập
            </Button>
          </Link>
        </Space>
      </div>
    </AntHeader>
  );
}