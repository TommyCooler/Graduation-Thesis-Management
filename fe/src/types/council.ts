// Request types
export interface CouncilCreateRequest {
  semester: string;
  topicId: number[];
}

// Note response
export interface NoteResponse {
  note: string; // Backend trả về "note" (chữ thường)
  accountName: string;
}

// Topic trong council response (matches TopicsDTOResponse)
export interface CouncilTopic {
  id: number;
  title: string;
  description: string;
  submitedAt: string | null;
  status: string | null;
  filePathUrl: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  notes?: NoteResponse[]; // Optional notes array
}

// Council member types
export interface CouncilMember {
  id: number;
  role: 'CHAIRMAN' | 'SECRETARY' | 'MEMBER';
  accountId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null; // Có thể null
}

// Council response types (matches CouncilResponse from backend)
export interface CouncilResponse {
  id: number;
  councilName: string;
  semester: string;
  date: string;
  retakeDate?: string | null; // Ngày chấm lại (optional)
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  councilMembers: CouncilMember[];
  topic: CouncilTopic[]; // Array of topics
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

// My Council types
export interface MyCouncilItem {
  role: string;
  councilId?: number; // optional if BE provides
  councilMemberId?: number; // ID của bản ghi CouncilMember
  councilName: string;
  semester: string;
  defenseDate: string;
  status: string;
  topicStatus?: string; // Trạng thái của đề tài
  topicsTitle: string;
  topicsDescription: string;
  fileUrl: string;
  defenseTime: string;
  topicId?: number; // optional if BE provides
  retakeDate?: string | null; // Ngày chấm lại (chỉ có khi topicStatus là RETAKING)
}

export interface MyCouncilApiResponse {
  code: number;
  message: string;
  data: MyCouncilItem[];
}

// Grouped council structure - nhóm theo ngày
export interface GroupedByDate {
  defenseDate: string;
  councils: {
    councilName: string;
    semester: string;
    status: string;
    role: string;
    retakeDate?: string | null; // Ngày chấm lại
    topics: {
      title: string;
      description: string;
      fileUrl: string;
      defenseTime: string;
      topicStatus?: string;
      topicId?: number;
      councilMemberId?: number; // ID của bản ghi CouncilMember
    }[];
  }[];
}