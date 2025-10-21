// Types cho Topic History
export interface TopicHistory {
  id: number;
  topicId: number;
  topicName: string;
  changedContent: string;
  updatedBy: string;
  updatedAt: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE';
}

// API Response types
export interface TopicHistoryResponse {
  id: number;
  topicId: number;
  topicName: string;
  changedContent: string;
  updatedBy: string;
  updatedAt: string;
  actionType: string;
}

export interface TopicHistoryApiResponse {
  code: number;
  message: string;
  result?: TopicHistoryResponse[];
  data?: TopicHistoryResponse[];
}

// Filter types
export interface TopicHistoryFilters {
  searchText?: string;
  actionType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'all';
  userFilter?: string;
  topicId?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Statistics types
export interface TopicHistoryStats {
  totalChanges: number;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  uniqueTopics: number;
  uniqueUsers: string[];
}

// Action type constants
export const ACTION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// Action display mapping
export const ACTION_DISPLAY = {
  [ACTION_TYPES.CREATE]: 'Tạo mới',
  [ACTION_TYPES.UPDATE]: 'Cập nhật',
  [ACTION_TYPES.DELETE]: 'Xóa',
} as const;

// Action colors for UI
export const ACTION_COLORS = {
  [ACTION_TYPES.CREATE]: 'green',
  [ACTION_TYPES.UPDATE]: 'blue',
  [ACTION_TYPES.DELETE]: 'red',
} as const;
