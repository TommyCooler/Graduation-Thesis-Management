// Common Types

export type User = {
    id: number;
    email: string;
    name: string;
    role: string;
    isHeadOfDepartment: boolean;
    isActive: boolean;
};

export type Lecturer = {
    id: number;
    name: string;
    email: string;
    department: string;
    isActive: boolean;
};

export type ApiError = {
    message: string;
    code: string;
    details?: any;
};

export type LoadingState = {
    isLoading: boolean;
    error?: string;
};

export type PaginationParams = {
    page: number;
    limit: number;
    total?: number;
};

export type SortOrder = 'ascend' | 'descend';

export type TableColumn<T> = {
    title: string;
    dataIndex: keyof T;
    key: string;
    render?: (value: any, record: T) => React.ReactNode;
    sorter?: (a: T, b: T) => number;
    width?: number;
    align?: 'left' | 'center' | 'right';
};

export type TabItem = {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
};

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type ThemeColor = {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
};
