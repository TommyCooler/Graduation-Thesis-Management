import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }
  };

  const requireAuth = (redirectTo: string = '/auth/login') => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.warning('Vui lòng đăng nhập để xem nội dung này');
        router.push(redirectTo);
        return false;
      }
      return true;
    }
    return false;
  };

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const getRole = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      message.success('Đăng xuất thành công');
      router.push('/auth/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    requireAuth,
    getToken,
    getRole,
    logout,
    checkAuth,
  };
};
