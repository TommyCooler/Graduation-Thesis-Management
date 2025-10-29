// Types cho Topics
export interface Topic {
  id: number;
  title: string;
  description: string;
  submitedAt: string | null;
  status: string;
  filePathUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface TopicResponse {
  id: number;
  title: string;
  description: string;
  submitedAt: string | null;
  status: string;
  filePathUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Request types
export interface TopicCreateRequest {
  title: string;
  description: string;
  status?: string;
  filePathUrl?: string;
  submitedAt?: string;
}

export interface TopicUpdateRequest {
  id?: number;
  title?: string;
  description?: string;
  submitedAt?: string;
  status?: string;
  filePathUrl?: string;
}

export interface TopicApiResponse {
  code: number;
  message: string;
  result?: TopicResponse | TopicResponse[]; // Old format (keep for compatibility)
  data?: TopicResponse | TopicResponse[]; // New format from TopicApprovalService
}

// Filter types
export interface TopicFilters {
  searchText?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'submitedAt';
  sortOrder?: 'asc' | 'desc';
}

// Statistics types
export interface TopicStats {
  totalTopics: number;
  draftCount: number;
  pendingCount: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentSubmissions: number;
}

export interface ApprovedTopic {
  topicID: number;
  topicTitle: string;
  description: string;
}

// Status constants
export const TOPIC_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
} as const;

export type TopicStatus = typeof TOPIC_STATUS[keyof typeof TOPIC_STATUS];

// Status display mapping
export const STATUS_DISPLAY = {
  [TOPIC_STATUS.DRAFT]: 'Nháp',
  [TOPIC_STATUS.PENDING]: 'Chờ xử lý',
  [TOPIC_STATUS.SUBMITTED]: 'Đã nộp',
  [TOPIC_STATUS.UNDER_REVIEW]: 'Đang xem xét',
  [TOPIC_STATUS.APPROVED]: 'Đã duyệt',
  [TOPIC_STATUS.REJECTED]: 'Từ chối',
  [TOPIC_STATUS.REVISION_REQUIRED]: 'Yêu cầu sửa đổi',
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  [TOPIC_STATUS.DRAFT]: 'default',
  [TOPIC_STATUS.PENDING]: 'cyan',
  [TOPIC_STATUS.SUBMITTED]: 'blue',
  [TOPIC_STATUS.UNDER_REVIEW]: 'orange',
  [TOPIC_STATUS.APPROVED]: 'green',
  [TOPIC_STATUS.REJECTED]: 'red',
  [TOPIC_STATUS.REVISION_REQUIRED]: 'yellow',
} as const;

// File types
export interface TopicFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Pagination types
export interface TopicPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTopicResponse {
  code: number;
  message: string;
  data: {
    content: TopicResponse[];
    pagination: TopicPagination;
  };
}