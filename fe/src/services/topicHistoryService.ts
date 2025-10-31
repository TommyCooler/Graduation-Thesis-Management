import { TopicHistory, TopicHistoryApiResponse, TopicHistoryFilters } from '../types/topic-history';

// Use the same base URL as topicService
const API_BASE_URL = process.env.TOPIC_API_BASE_URL || 'http://localhost:8080';

class TopicHistoryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/topic-approval-service/api/topic-history`;
  }

  /**
   * Helper function to get auth headers
   */
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
   * Lấy lịch sử thay đổi của một đề tài cụ thể
   */
  async getTopicHistory(topicId: number): Promise<TopicHistory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topic/${topicId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicHistoryApiResponse = await response.json();
      
      // Handle both 'result' and 'data' fields
      const historyData = data.result || data.data || [];
      return Array.isArray(historyData) ? this.mapToTopicHistory(historyData) : [];
    } catch (error) {
      console.error('Error fetching topic history:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử thay đổi của một người dùng cụ thể
   */
  async getHistoryByUser(username: string): Promise<TopicHistory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${username}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicHistoryApiResponse = await response.json();
      const historyData = data.result || data.data || [];
      return Array.isArray(historyData) ? this.mapToTopicHistory(historyData) : [];
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả lịch sử thay đổi với bộ lọc
   */
  async getAllTopicHistory(filters?: TopicHistoryFilters): Promise<TopicHistory[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.searchText) {
        queryParams.append('search', filters.searchText);
      }
      if (filters?.actionType && filters.actionType !== 'all') {
        queryParams.append('actionType', filters.actionType);
      }
      if (filters?.userFilter && filters.userFilter !== 'all') {
        queryParams.append('user', filters.userFilter);
      }
      if (filters?.topicId) {
        queryParams.append('topicId', filters.topicId.toString());
      }
      if (filters?.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicHistoryApiResponse = await response.json();
      const historyData = data.result || data.data || [];
      return Array.isArray(historyData) ? this.mapToTopicHistory(historyData) : [];
    } catch (error) {
      console.error('Error fetching all topic history:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê lịch sử thay đổi
   */
  async getTopicHistoryStats(): Promise<{
    totalChanges: number;
    createCount: number;
    updateCount: number;
    deleteCount: number;
    uniqueTopics: number;
    uniqueUsers: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = data.result || data.data || {};
      return result;
    } catch (error) {
      console.error('Error fetching topic history stats:', error);
      throw error;
    }
  }

  /**
   * Tạo bản ghi lịch sử mới (thường được gọi từ các service khác)
   */
  async createTopicHistory(historyData: {
    topicId: number;
    changedContent: string;
    updatedBy: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
  }): Promise<TopicHistory> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(historyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = data.result || data.data;
      return result ? this.mapToTopicHistory([result])[0] : {} as TopicHistory;
    } catch (error) {
      console.error('Error creating topic history:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi dữ liệu từ API response sang TopicHistory
   */
  private mapToTopicHistory(apiData: any[]): TopicHistory[] {
    return apiData.map(item => ({
      id: item.id,
      topicId: item.topicId,
      topicName: item.topicName || 'N/A',
      changedContent: item.changedContent || '',
      updatedBy: item.updatedBy || 'Unknown',
      updatedAt: item.updatedAt || new Date().toISOString(),
      actionType: item.actionType || 'UPDATE',
    }));
  }

  /**
   * Format ngày tháng cho hiển thị
   */
  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Lấy màu sắc cho action type
   */
  getActionColor(actionType: string): string {
    const colors = {
      'CREATE': 'green',
      'UPDATE': 'blue',
      'DELETE': 'red',
    };
    return colors[actionType as keyof typeof colors] || 'default';
  }

  /**
   * Lấy text hiển thị cho action type
   */
  getActionText(actionType: string): string {
    const texts = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'DELETE': 'Xóa',
    };
    return texts[actionType as keyof typeof texts] || actionType;
  }
}

// Export singleton instance
export const topicHistoryService = new TopicHistoryService();
export default topicHistoryService;
