import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface WithAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingMessage?: string;
}

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithAuthProps> => {
  const ComponentWithAuth: React.FC<P & WithAuthProps> = (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      checkAuthentication();
    }, []);

    const checkAuthentication = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
        } else {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      }
    };

    const handleLogin = () => {
      router.push(props.redirectTo || '/auth/login');
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Spin size="large" tip={props.loadingMessage || 'Đang kiểm tra xác thực...'} />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Result
            status="403"
            icon={<LockOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
            title="Yêu cầu đăng nhập"
            subTitle="Bạn cần đăng nhập để xem nội dung này."
            extra={
              <Button type="primary" size="large" onClick={handleLogin}>
                Đăng nhập ngay
              </Button>
            }
          />
        </div>
      );
    }

    return <WrappedComponent {...(props as P)} />;
  };

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuth;
};
