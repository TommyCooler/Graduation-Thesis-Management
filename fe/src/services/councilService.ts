import {
  CouncilCreateRequest,
  CouncilResponse,
  CouncilApiResponse,
  CouncilListApiResponse
} from '../types/council';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class CouncilService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/topic-approval-service/api/councils`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Tạo hội đồng mới
   */
  async createCouncil(request: CouncilCreateRequest): Promise<CouncilResponse> {
    try {
      console.log('Creating council with request:', request);
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
      });

      console.log('Response status:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }     
      const data: CouncilApiResponse = await response.json();
      
      if (data.code !== 201) {
        throw new Error(data.message || 'Failed to create council');
      }

      return data.data;
    } catch (error) {
      console.error('Error creating council:', error);
      throw error;
    }
  }
  /**
   * Lấy danh sách hội đồng
   */
  async getAllCouncils(): Promise<CouncilResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/all`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CouncilListApiResponse = await response.json();
      console.log('📦 Councils list API response:', data);
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to fetch councils');
      }

      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      console.error('Error fetching councils:', error);
      throw error;
    }
  }

  /**
   * Lấy hội đồng theo ID
   */
  async getCouncilById(id: number): Promise<CouncilResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CouncilApiResponse = await response.json();
      console.log('📦 Council details API response:', data);
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to fetch council');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching council by ID:', error);
      throw error;
    }
  }

  /**
   * Cập nhật hội đồng
   */
  async updateCouncil(id: number, updates: Partial<CouncilCreateRequest>): Promise<CouncilResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CouncilApiResponse = await response.json();
      console.log('📦 Council update API response:', data);
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to update council');
      }

      return data.data;
    } catch (error) {
      console.error('Error updating council:', error);
      throw error;
    }
  }

  /**
   * Xóa hội đồng
   */
  async deleteCouncil(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Council delete API response:', data);
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to delete council');
      }
    } catch (error) {
      console.error('Error deleting council:', error);
      throw error;
    }
  }

  /**
   * Utility functions
   */
  
  getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'PLANNED': 'Đã lên kế hoạch',
      'IN_PROGRESS': 'Đang diễn ra', 
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'PLANNED': 'blue',
      'IN_PROGRESS': 'orange',
      'COMPLETED': 'green', 
      'CANCELLED': 'red',
    };
    return colorMap[status] || 'default';
  }

  getRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'CHAIRMAN': 'Chủ tịch',
      'SECRETARY': 'Thư ký',
      'MEMBER': 'Thành viên',
    };
    return roleMap[role] || role;
  }

  getRoleColor(role: string): string {
    const colorMap: Record<string, string> = {
      'CHAIRMAN': 'gold',
      'SECRETARY': 'blue',
      'MEMBER': 'default',
    };
    return colorMap[role] || 'default';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Use a consistent format that doesn't depend on locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Use a consistent format that doesn't depend on locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date time:', error);
      return dateString;
    }
  }
}

export const councilService = new CouncilService();
export default councilService;
