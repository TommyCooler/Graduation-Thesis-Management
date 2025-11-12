'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Card, Table, Tag, Select, Typography, Input, Space,
    Button, Popconfirm, message, Skeleton, Tooltip, Empty, Divider, Badge
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ReloadOutlined, CheckOutlined, SearchOutlined, SafetyCertificateOutlined,
    TeamOutlined, ApartmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

type Role = 'HEADOFDEPARTMENT' | 'LECTURER' | 'ADMIN';

interface Account {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    role: Role;
    active?: boolean;
    createdAt?: string;
}

interface Paged<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const ROLE_LABEL: Record<Role, string> = {
    HEADOFDEPARTMENT: 'Trưởng bộ môn',
    LECTURER: 'Giảng viên',
    ADMIN: 'Quản trị',
};

const roleTag = (r: Role) => {
    const color =
        r === 'HEADOFDEPARTMENT' ? 'geekblue' :
            r === 'LECTURER' ? 'green' :
                'volcano';
    return <Tag color={color}>{ROLE_LABEL[r]}</Tag>;
};

const roleOptions = (current?: Role) =>
    (['HEADOFDEPARTMENT', 'LECTURER', 'ADMIN'] as Role[]).map(v => ({
        label: ROLE_LABEL[v],
        value: v,
        disabled: v === current, // không cho chọn lại đúng role hiện tại
    }));

export default function AdminRolesPage() {
    const [rows, setRows] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [pending, setPending] = useState<Record<number, Role>>({});
    const searchDebounceRef = useRef<number | null>(null);
    const router = useRouter();

    const onLogout = async () => {
        try {
            setLoading(true);
            await fetch(`${API_BASE}/account-service/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            message.success('Đã đăng xuất.');
            router.push('/auth/login');
        } catch (e: any) {
            message.error('Lỗi khi đăng xuất');
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async (p = page, s = pageSize) => {
        try {
            setLoading(true);
            const res = await fetch(
                `${API_BASE}/account-service/api/accounts/all-paged?page=${p}&size=${s}`,
                { headers: { Accept: '*/*' }, credentials: 'include' }
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Không tải được danh sách');

            const data: Paged<Account> = json.data ?? json;
            setRows(data.content || []);
            setTotal(data.totalElements || 0);
            if (typeof data.number === 'number') setPage(data.number + 1);
        } catch (e: any) {
            message.error(e.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts(page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce tìm kiếm để mượt hơn
    const onChangeSearch = (val: string) => {
        setSearch(val);
        if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = window.setTimeout(() => {
            // nếu backend có API search thì gọi tại đây
            // fetchAccounts(1, pageSize)
        }, 300);
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            r =>
                r.name?.toLowerCase().includes(q) ||
                r.email?.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const stats = useMemo(() => {
        const base = { HEADOFDEPARTMENT: 0, LECTURER: 0, ADMIN: 0 } as Record<Role, number>;
        rows.forEach(r => { base[r.role] += 1; });
        return base;
    }, [rows]);

    const handleChangeSelect = (id: number, value: Role) => {
        setPending(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirmUpdate = async (acc: Account) => {
        const newRole = pending[acc.id];
        if (!newRole || newRole === acc.role) {
            message.info('Không có thay đổi để cập nhật.');
            return;
        }
        try {
            setLoading(true);
            const url = `${API_BASE}/account-service/api/accounts/${acc.id}/admin-update-role?role=${encodeURIComponent(newRole)}`;
            const res = await fetch(url, { method: 'PUT', headers: { Accept: '*/*' }, credentials: 'include' });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.message || 'Cập nhật vai trò thất bại');
            message.success(json.message || 'Đã cập nhật vai trò');

            setRows(prev => prev.map(r => (r.id === acc.id ? { ...r, role: newRole } : r)));
            setPending(prev => { const { [acc.id]: _, ...rest } = prev; return rest; });
        } catch (e: any) {
            message.error(e.message || 'Có lỗi khi cập nhật vai trò');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Account> = [
        { title: 'ID', dataIndex: 'id', width: 84, fixed: 'left' as const },
        {
            title: 'Tên',
            dataIndex: 'name',
            ellipsis: true,
            render: (v, record) => (
                <Space>
                    <Badge color="#ff6b35" />
                    <Text strong className="max-w-[220px]" ellipsis={{ tooltip: v }}>{v}</Text>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            ellipsis: true,
            render: (v) => <Text copyable={{ tooltips: ['Sao chép', 'Đã sao chép'] }}>{v}</Text>,
        },
        {
            title: 'SĐT',
            dataIndex: 'phoneNumber',
            width: 140,
            render: (v: string | null) => v || <Text type="secondary">—</Text>,
        },
        {
            title: 'Role hiện tại',
            dataIndex: 'role',
            width: 180,
            render: (r: Role) => roleTag(r),
        },
        {
            title: 'Đổi role',
            key: 'change',
            width: 300,
            render: (_, record) => {
                const nextRole = pending[record.id] ?? record.role;
                const changed = nextRole !== record.role;
                return (
                    <Space.Compact style={{ width: '100%' }}>
                        <Select<Role>
                            style={{ width: '100%' }}
                            value={nextRole}
                            options={roleOptions(record.role)}
                            optionRender={(opt) => (
                                <Space>
                                    {opt.data.value === 'HEADOFDEPARTMENT' && <ApartmentOutlined />}
                                    {opt.data.value === 'LECTURER' && <TeamOutlined />}
                                    {opt.data.value === 'ADMIN' && <SafetyCertificateOutlined />}
                                    <span>{opt.data.label}</span>
                                </Space>
                            )}
                            onChange={(val) => handleChangeSelect(record.id, val)}
                        />
                        <Tooltip title={changed ? 'Xác nhận cập nhật' : 'Không có thay đổi'}>
                            <Popconfirm
                                title="Xác nhận cập nhật vai trò?"
                                onConfirm={() => handleConfirmUpdate(record)}
                                okText="Cập nhật"
                                cancelText="Hủy"
                                disabled={!changed}
                            >
                                <Button type="primary" icon={<CheckOutlined />} disabled={!changed} />
                            </Popconfirm>
                        </Tooltip>
                    </Space.Compact>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#fff7f3] to-white p-6">
            <div className="mx-auto max-w-7xl space-y-4">
                {/* Page header */}
                <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
                    <div className="flex items-center justify-between">
                        <Title level={3} style={{ margin: 0 }}>Quản lý vai trò tài khoản</Title>
                        <Space>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                placeholder="Tìm theo tên hoặc email…"
                                value={search}
                                onChange={(e) => onChangeSearch(e.target.value)}
                                className="w-72"
                            />
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchAccounts(page, pageSize)}
                            >
                                Làm mới
                            </Button>
                            <Button
                                danger
                                type="primary"
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 border-none"
                            >
                                Đăng xuất
                            </Button>
                        </Space>
                    </div>

                </div>
                <div className='text-black text-xl'>Trang số <label className='border-0 rounded-2xl px-4 py-1 bg-orange-500 text-white'>{page}</label> bao gồm</div>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-sm rounded-2xl">
                        <Space direction="vertical" size={2}>
                            <Text type="secondary">Trưởng bộ môn</Text>
                            <Title level={4} style={{ margin: 0 }}>{stats.HEADOFDEPARTMENT}</Title>
                        </Space>
                    </Card>
                    <Card className="shadow-sm rounded-2xl">
                        <Space direction="vertical" size={2}>
                            <Text type="secondary">Giảng viên</Text>
                            <Title level={4} style={{ margin: 0 }}>{stats.LECTURER}</Title>
                        </Space>
                    </Card>
                    <Card className="shadow-sm rounded-2xl">
                        <Space direction="vertical" size={2}>
                            <Text type="secondary">Quản trị</Text>
                            <Title level={4} style={{ margin: 0 }}>{stats.ADMIN}</Title>
                        </Space>
                    </Card>
                </div>

                {/* Table */}
                <Card className="shadow-md rounded-2xl">
                    {loading && rows.length === 0 ? (
                        <>
                            <Skeleton active paragraph={{ rows: 2 }} />
                            <Divider />
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </>
                    ) : (
                        <Table<Account>
                            rowKey="id"
                            columns={columns}
                            dataSource={filtered}
                            loading={loading}
                            sticky
                            bordered
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Chưa có tài khoản nào"
                                    />
                                ),
                            }}
                            pagination={{
                                current: page,
                                pageSize,
                                total,
                                showSizeChanger: true,
                                showTotal: (t) => `Tổng ${t} tài khoản`,
                                onChange: (p, s) => {
                                    setPage(p);
                                    setPageSize(s);
                                    fetchAccounts(p, s);
                                },
                            }}
                            scroll={{ x: 960 }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}
