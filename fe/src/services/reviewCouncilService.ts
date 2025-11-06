// 📘 reviewCouncilService.ts

type CouncilStatus = 'CREATED' | 'COMPLETED' | 'CANCELLED' | string;

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
}

export interface ReviewCouncilMember {
  accountID: number;
  accountName: string;
  overallComments: string;
}

export interface ReviewCouncilUIModel {
  id: number;
  name: string;
  topicID: number;
  topicTitle: string;
  milestone: string; // hiển thị đẹp (WEEK 4)
  reviewDate?: string; // hiển thị YYYY-MM-DD
  status: string;
  lecturers: ReviewCouncilMember[];
  feedback?: string;
}

export interface Lecturer {
  accountID: number;
  accountName: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class ReviewCouncilService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/topic-approval-service/api/progress-review-councils`;
  }

  // 📦 Lấy danh sách hội đồng
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

  // ➕ Tạo hội đồng mới
  async createCouncil(payload: {
    name: string;
    topicID: number;
    milestone: string;
    reviewDate?: string | null;
    lecturerAccountIds: number[];
  }): Promise<ReviewCouncilUIModel> {
    const body: any = {
      councilName: payload.name,
      topicID: payload.topicID,
      milestone: this.formatMilestoneForBackend(payload.milestone),
      lecturerAccountIds: payload.lecturerAccountIds,
    };

    // 🔥 Chỉ thêm reviewDate nếu có
    if (payload.reviewDate) {
      body.reviewDate = payload.reviewDate;
    }

    const response = await fetch(`${this.baseUrl}/${payload.topicID}`, {
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


  // 👩‍🏫 Lấy danh sách giảng viên (thành viên) của 1 hội đồng
  async getCouncilLecturers(
    councilId: number
  ): Promise<ReviewCouncilMember[]> {
    const response = await fetch(`${this.baseUrl}/${councilId}/members`, {
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
      })
    );
  }

  // 📦 Lấy danh sách tất cả giảng viên
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

  // 🧩 Lấy danh sách hội đồng theo topicID (và lấy luôn thành viên)
  async getCouncilsByTopicID(
    topicID: number
  ): Promise<ReviewCouncilUIModel[]> {
    const response = await fetch(`${this.baseUrl}/${topicID}`, {
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

  // 👮‍♀️ Safe fetch giảng viên
  private async getCouncilLecturersSafe(
    councilId: number
  ): Promise<ReviewCouncilMember[]> {
    try {
      return await this.getCouncilLecturers(councilId);
    } catch (_err) {
      return [];
    }
  }

  // 🧩 Map sang model dùng cho UI
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
    };
  }

  // Trạng thái
  private mapStatus(status?: CouncilStatus): string {
    if (!status) return 'Đã lập';
    const map: Record<string, string> = {
      CREATED: 'Đã lập',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return map[status] || status;
  }

  // 👉 Backend → UI
  private formatMilestoneForUI(m: string): string {
    return m.replace('_', ' ');
  }

  // 👉 UI → Backend
  private formatMilestoneForBackend(m: string): string {
    return m.replace(' ', '_');
  }

  // 📅 Format ngày
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
