import dayjs from 'dayjs';
type CouncilStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED' | string;

export interface ReviewCouncilApiModel {
  councilID: number;
  councilName: string;
  topicID: number;
  topicTitle?: string;
  milestone: string;
  reviewDate?: string | null;
  status: string;
  createdAt?: string;
  overallComment?: string | null;
  reviewFormat?: string | null;
  meetingLink?: string | null;
  roomNumber?: string | null;
}

export interface ReviewCouncilMember {
  accountID: number;
  accountName: string;
  overallComments: string;
  email: string;
  decision: string;
}

export interface ReviewCouncilUIModel {
  id: number;
  name: string;
  topicID: number;
  topicTitle: string;
  milestone: string; 
  reviewDate?: string; 
  status: string;
  lecturers: ReviewCouncilMember[];
  feedback?: string;
  reviewFormat?: string;
  meetingLink?: string;
  roomNumber?: string;
}

export interface Lecturer {
  accountID: number;
  accountName: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class ReviewCouncilService {
  private baseUrl: string;
  private gatewayPrefix: string = '/topic-approval-service';

  constructor() {
    this.baseUrl = `${API_BASE_URL}${this.gatewayPrefix}/api/progress-review-councils`;
  }

  // Lấy danh sách hội đồng
  async getAllCouncils(): Promise<ReviewCouncilUIModel[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch councils: ${response.status}`);
    }

    const data = await response.json();
    const councils: ReviewCouncilApiModel[] =
      data.result ?? data.data ?? data ?? [];

    // Lấy luôn danh sách giảng viên của từng hội đồng
    const councilsWithMembers = await Promise.all(
      councils.map(async (c) => {
        const lecturers = await this.getCouncilLecturersSafe(c.councilID);
        return this.mapToUIModel(c, lecturers);
      })
    );

    return councilsWithMembers;
  }

  // Tạo hội đồng mới
  async createCouncil(payload: {
    topicID: number;
    milestone: string;
    reviewDate?: string | null;
    reviewFormat: string;
    meetingLink?: string | null;
    roomNumber?: string | null;
    lecturerAccountIds: number[];
  }): Promise<ReviewCouncilUIModel> {
    const body: any = {
      milestone: this.formatMilestoneForBackend(payload.milestone),
      reviewFormat: payload.reviewFormat,
      meetingLink: payload.meetingLink,
      roomNumber: payload.roomNumber,
      lecturerAccountIds: payload.lecturerAccountIds,
    };

    if (payload.reviewDate) {
      body.reviewDate = payload.reviewDate;
    }

    const response = await fetch(`${this.baseUrl}/topic/${payload.topicID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Đã xảy ra lỗi hệ thống');
    }

    const data = await response.json();
    const created: ReviewCouncilApiModel = data.result ?? data.data ?? data;
    const lecturers = await this.getCouncilLecturersSafe(created.councilID);

    return this.mapToUIModel(created, lecturers);
  }



  // Lấy danh sách giảng viên (thành viên) của 1 hội đồng
  async getCouncilLecturers(
    councilId: number
  ): Promise<ReviewCouncilMember[]> {
    const response = await fetch(`${API_BASE_URL}${this.gatewayPrefix}/api/review-council-members/${councilId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch council members: ${response.status}`
      );
    }

    const json = await response.json();
    const members = Array.isArray(json.data) ? json.data : [];

    return members.map(
      (m: any): ReviewCouncilMember => ({
        accountID: m.accountID,
        accountName: m.accountName,
        overallComments: m.overallComments || '',
        email: m.email,
        decision: m.decision,
      })
    );
  }

  // Lấy danh sách tất cả giảng viên
  async getAllLecturers(): Promise<Lecturer[]> {
    const response = await fetch(`${this.baseUrl}/lecturers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lecturers: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  }

  // Lấy danh sách hội đồng theo topicID (và lấy luôn thành viên)
  async getCouncilsByTopicID(
    topicID: number
  ): Promise<ReviewCouncilUIModel[]> {
    const response = await fetch(`${this.baseUrl}/topic/${topicID}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch councils for topic ${topicID}: ${response.status}`
      );
    }

    const data = await response.json();
    const councils: ReviewCouncilApiModel[] =
      data.result ?? data.data ?? data ?? [];

    const councilsWithMembers = await Promise.all(
      councils.map(async (c) => {
        const lecturers = await this.getCouncilLecturersSafe(c.councilID);
        return this.mapToUIModel(c, lecturers);
      })
    );

    return councilsWithMembers;
  }

  // Safe fetch giảng viên
  private async getCouncilLecturersSafe(
    councilId: number
  ): Promise<ReviewCouncilMember[]> {
    try {
      return await this.getCouncilLecturers(councilId);
    } catch (_err) {
      return [];
    }
  }
  // comment cho council
  async updateCouncilComment(
    councilID: number,
    overallComments: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${this.gatewayPrefix}/api/review-council-members/${councilID}/comment`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ overallComments }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể cập nhật nhận xét');
    }
  }

  // Cập nhật trạng thái hội đồng
  async updateCouncilStatus(councilID: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${councilID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật trạng thái hội đồng');
      }

      console.log(`Cập nhật trạng thái hội đồng ${councilID} thành công`);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật trạng thái hội đồng:', error);
      throw error;
    }
  }

  async getCouncilsForCalendar(): Promise<ReviewCouncilUIModel[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Không thể tải danh sách lịch hội đồng');
    return response.json();
  }

  // Lấy chi tiết 1 hội đồng theo ID (và kèm danh sách giảng viên)
  async getCouncilById(councilId: number): Promise<ReviewCouncilUIModel> {
    const response = await fetch(`${this.baseUrl}/${councilId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Không thể tải thông tin hội đồng ID ${councilId}: ${response.status}`);
    }

    const data = await response.json();
    const council: ReviewCouncilApiModel = data.result ?? data.data ?? data;

   
    const lecturers = await this.getCouncilLecturersSafe(council.councilID);

    // Trả về dạng UI model
    return this.mapToUIModel(council, lecturers);
  }

  // Giảng viên chấm bài (grade)
  async gradeCouncilMember(
    councilID: number,
    overallComments: string,
    decision: 'ACCEPT' | 'REJECT' | 'NOT_DECIDED'
  ): Promise<void> {
    const body = {
      overallComments,
      decision,
    };

    const response = await fetch(
      `${API_BASE_URL}${this.gatewayPrefix}/api/review-council-members/${councilID}/grade`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể chấm bài hội đồng');
    }

    console.log(`Giảng viên đã chấm hội đồng ${councilID} thành công`);
  }

  async updateCouncilDetails(
    councilID: number,
    payload: {
      reviewDate: string | null;
      reviewFormat: string;
      meetingLink: string | null;
      roomNumber: string | null;
      lecturerAccountIds: number[];
    }
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${councilID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        reviewDate: payload.reviewDate ? payload.reviewDate : null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cập nhật hội đồng thất bại.');
    }

    console.log(`Cập nhật hội đồng ID ${councilID} thành công`);
  }

  // Map sang model dùng cho UI
  private mapToUIModel(
    api: ReviewCouncilApiModel,
    lecturers: ReviewCouncilMember[]
  ): ReviewCouncilUIModel {
    return {
      id: api.councilID,
      name: api.councilName,
      topicID: api.topicID,
      topicTitle: api.topicTitle || 'Chưa có tên đề tài',
      milestone: this.formatMilestoneForUI(api.milestone),
      reviewDate: api.reviewDate ? this.formatDateYYYYMMDD(api.reviewDate) : '',
      status: this.mapStatus(api.status),
      lecturers,
      feedback: api.overallComment || '',
      reviewFormat: api.reviewFormat || '',
      meetingLink: api.meetingLink || '',
      roomNumber: api.roomNumber || '',
    };
  }

  // Trạng thái
  private mapStatus(status?: CouncilStatus): string {
    if (!status) return 'Đã lập';
    const map: Record<string, string> = {
      PLANNED: 'Đã lập',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return map[status] || status;
  }




  // Backend → UI
  private formatMilestoneForUI(m: string): string {
    return m.replace('_', ' ');
  }

  // UI → Backend
  private formatMilestoneForBackend(m: string): string {
    return m.replace(' ', '_');
  }

  // Format ngày
  private formatDateYYYYMMDD(dateStr: string): string {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

export const reviewCouncilService = new ReviewCouncilService();
export default reviewCouncilService;
