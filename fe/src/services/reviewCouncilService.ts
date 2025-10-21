
type CouncilStatus = 'CREATED' | 'COMPLETED' | 'CANCELLED' | string;

export interface ReviewCouncilApiModel {
  councilID: number;
  councilName: string;
  topicID: number;
  milestone: string;
  reviewDate: string;
  status: string;
  createdAt?: string;
  overallComment?: string | null;
}


export interface ReviewCouncilUIModel {
  id: number;
  name: string;
  topic: string;
  milestone: string;
  reviewDate: string; // YYYY-MM-DD for display
  status: string;
  lecturers: string[];
  feedback?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083';

class ReviewCouncilService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/progress-review-councils`;
  }

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
    const councils: ReviewCouncilApiModel[] = data.result ?? data.data ?? data ?? [];

    // For each council, load its members to build lecturers list
    
    // Map dữ liệu sang UI model
    const councilsWithMembers = await Promise.all(
      councils.map(async (c) => {
        const lecturers = await this.getCouncilLecturersSafe(c.councilID);
        return this.mapToUIModel(c, lecturers);
      })
    );
    return councilsWithMembers;
  }

  async createCouncil(payload: {
    name: string;
    topic: string;
    milestone: string;
    reviewDate: string; // YYYY-MM-DD
    lecturers: string[]; // names or ids depending on backend; send as-is
  }): Promise<ReviewCouncilUIModel> {
    const body = {
      name: payload.name,
      topic: payload.topic,
      milestone: payload.milestone,
      reviewDate: payload.reviewDate,
      lecturers: payload.lecturers,
    };

    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Failed to create council: ${response.status}`);
    }
    const data = await response.json();
    const created: ReviewCouncilApiModel = data.result ?? data.data ?? data;
    const lecturers = await this.getCouncilLecturersSafe(created.councilID);
    return this.mapToUIModel(created, lecturers);
  }

  async getCouncilLecturers(councilId: number): Promise<string[]> {
  const response = await fetch(`${this.baseUrl}/${councilId}/members`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch council members: ${response.status}`);
  }

  const json = await response.json();
  console.log('Members response:', json); // debug xem dữ liệu thật

  const members = Array.isArray(json.data) ? json.data : [];
  return members.map((m: any) => m.accountName).filter(Boolean);
}


  // Helpers
  private async getCouncilLecturersSafe(councilId: number): Promise<string[]> {
    try {
      return await this.getCouncilLecturers(councilId);
    } catch (_err) {
      return [];
    }
  }

  private mapToUIModel(api: ReviewCouncilApiModel, lecturers: string[]): ReviewCouncilUIModel {
    return {
       id: api.councilID,
      name: api.councilName,
      topic: api.topicID ? `Topic #${api.topicID}` : 'N/A',
      milestone: this.formatMilestone(api.milestone),
      reviewDate: this.formatDateYYYYMMDD(api.reviewDate),
      status: api.status || 'Đã lập',
      lecturers,
      feedback: api.overallComment || '',
    };
  }

  private mapStatus(status?: CouncilStatus): string {
    if (!status) return 'Đã lập';
    const map: Record<string, string> = {
      CREATED: 'Đã lập',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return map[status] || status;
  }

    private formatMilestone(m: string): string {
    return m.replace('_', ' '); // ví dụ: WEEK_4 → WEEK 4
  }

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


