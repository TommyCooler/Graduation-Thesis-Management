import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

export interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  lecturerId?: string;
  employeeId?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
      
      if (token) {
        await fetchUserInfo();
      }
      
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/account-service/api/auth/me`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data?.data || null);
      } else {
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setUserInfo(null);
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
      setUserInfo(null);
      message.success('Đăng xuất thành công');
      router.push('/auth/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    userInfo,
    requireAuth,
    getToken,
    getRole,
    logout,
    checkAuth,
    fetchUserInfo,
  };
};
