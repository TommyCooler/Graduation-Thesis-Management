'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';


export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.toLowerCase().endsWith('@fpt.edu.vn')) {
      toast.warn('Vui lòng dùng email @fpt.edu.vn');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    const payload = {
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber.trim(),
    };

    const doRegister = async () => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Đăng ký thất bại!');
      return data;
    };

    setLoading(true);
    try {
      await toast.promise(doRegister(), {
        pending: 'Đang tạo tài khoản...',
        success: 'Đăng ký thành công! Kiểm tra email để nhập OTP.',
        error: 'Có lỗi xảy ra, vui lòng thử lại sau.',
      });
      router.push(`/auth/otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Khung lớn hai cột – đồng bộ với Login */}
      <div className="w-full max-w-6xl bg-white rounded-[28px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT: banner gradient + thông điệp website */}
        <div className="flex justify-center items-center relative p-8 md:p-12 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-400 text-white">
          <div className="max-w-md mt-3">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Quản lý<br />đồ án sinh viên<br />nhanh & hiệu quả.
            </h1>
            <p className="mt-4 text-white/90 font-medium">
              Dành cho giảng viên: theo dõi tiến độ nhóm, duyệt mốc, chấm điểm và phản hồi
              ngay trên một hệ thống tập trung.
            </p>
          </div>

          <div className="absolute top-6 left-6 bg-white/20 rounded-full px-3 py-2 text-sm font-semibold backdrop-blur">
            FPT Education
          </div>
        </div>


        {/* RIGHT: form đăng ký – style khớp trang Login */}
        <div className="px-6 md:px-10 py-10 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-bold text-4xl text-orange-500">FPT EDUCATION</span>
            </div>

            <h2 className="text-3xl font-bold m-0 leading-none text-black mb-2">Create Account</h2>
            <p className="text-gray-500 font-medium">Tham gia hệ thống quản lý đồ án sinh viên</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                value={form.fullName}
                onChange={handleChange}
                required
                className="text-gray-900 w-full h-12 rounded-2xl bg-[#f3f5f9] border-0 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                name="email"
                placeholder="yourname@fpt.edu.vn"
                value={form.email}
                onChange={handleChange}
                required
                className="text-gray-900 w-full h-12 rounded-2xl bg-[#f3f5f9] border-0 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{8,15}"
                className="text-gray-900 w-full h-12 rounded-2xl bg-[#f3f5f9] border-0 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu (≥ 6 ký tự)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="text-gray-900 w-full h-12 rounded-2xl bg-[#f3f5f9] border-0 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="text-gray-900 w-full h-12 rounded-2xl bg-[#f3f5f9] border-0 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-2xl text-base font-bold transition-all duration-300 ${loading
                  ? 'bg-orange-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                  }`}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <a href="/auth/login" className="text-orange-500 font-semibold hover:underline">
                Đăng nhập ngay
              </a>
            </div>

            <div className="text-center mt-3">
              <a href="/" className="text-gray-500 hover:text-orange-500">← Quay về trang chủ</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
