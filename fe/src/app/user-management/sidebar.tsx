'use client';
import { Layout, Button, Menu } from 'antd';
import { 
  UserOutlined, TeamOutlined, SettingOutlined, FileTextOutlined, 
  DashboardOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (    <Sider 
      width={250} 
      collapsible 
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="bg-white shadow-lg border-r border-gray-100"
      trigger={null}
    >
      {/* Toggle Sidebar Button */}
      <div className="p-4 text-right">
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
      
      {/* Sidebar Menu */}
      <Menu
        mode="inline"
        defaultSelectedKeys={['users']}
        className="border-r-0"
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">Tổng quan</Link>,
          },
          {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link href="/user-management">Quản lý người dùng</Link>,
          },
          {
            key: 'topics',
            icon: <FileTextOutlined />,
            label: <Link href="/topics-management">Quản lý đề tài</Link>,
          },
          {
            key: 'departments',
            icon: <TeamOutlined />,
            label: <Link href="/departments-management">Quản lý khoa/bộ môn</Link>,
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings">Cấu hình hệ thống</Link>,
          },
        ]}
      />
    </Sider>
  );
}