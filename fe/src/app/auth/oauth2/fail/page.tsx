'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Result } from 'antd';
import { FrownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function OAuth2FailurePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('Đăng nhập bằng Google thất bại.');

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) setMessage(decodeURIComponent(error));
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff5f0] to-white p-6">
            <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
                <h1 className="text-2xl font-bold mb-2 text-[#ff6b35]">Đăng nhập thất bại</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button
                    type="primary"
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                    onClick={() => router.push('/auth/login')}
                >
                    Quay lại đăng nhập
                </Button>
            </div>
        </div>
    );
}
