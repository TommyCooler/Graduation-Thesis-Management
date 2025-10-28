

// Request types
export interface CouncilCreateRequest {
  semester: string;
  topicId: number;
}

// Council member types
export interface CouncilMember {
  id: number;
  role: 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';
  accountId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

// Council response types
export interface CouncilResponse {
  id: number;
  councilName: string;
  semester: string;
  date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  slot: number;
  councilMembers: CouncilMember[];
  topicName: string;
}

// API response wrapper
export interface CouncilApiResponse {
  code: number;
  message: string;
  data: CouncilResponse;
}

// List API response
export interface CouncilListApiResponse {
  code: number;
  message: string;
  data: CouncilResponse[];
}

// Status display mapping
export const COUNCIL_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type CouncilStatus = typeof COUNCIL_STATUS[keyof typeof COUNCIL_STATUS];

export const COUNCIL_STATUS_DISPLAY = {
  [COUNCIL_STATUS.PLANNED]: 'Đã lên kế hoạch',
  [COUNCIL_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [COUNCIL_STATUS.COMPLETED]: 'Đã hoàn thành',
  [COUNCIL_STATUS.CANCELLED]: 'Đã hủy',
} as const;

export const COUNCIL_STATUS_COLORS = {
  [COUNCIL_STATUS.PLANNED]: 'blue',
  [COUNCIL_STATUS.IN_PROGRESS]: 'orange',
  [COUNCIL_STATUS.COMPLETED]: 'green',
  [COUNCIL_STATUS.CANCELLED]: 'red',
} as const;

// Role display mapping
export const COUNCIL_ROLE = {
  CHAIRMAN: 'CHAIRMAN',
  SECRETARY: 'SECRETARY',
  MEMBER: 'MEMBER',
} as const;

export type CouncilRole = typeof COUNCIL_ROLE[keyof typeof COUNCIL_ROLE];

export const COUNCIL_ROLE_DISPLAY = {
  [COUNCIL_ROLE.CHAIRMAN]: 'Chủ tịch',
  [COUNCIL_ROLE.SECRETARY]: 'Thư ký',
  [COUNCIL_ROLE.MEMBER]: 'Thành viên',
} as const;

export const COUNCIL_ROLE_COLORS = {
  [COUNCIL_ROLE.CHAIRMAN]: 'gold',
  [COUNCIL_ROLE.SECRETARY]: 'blue',
  [COUNCIL_ROLE.MEMBER]: 'default',
} as const;
