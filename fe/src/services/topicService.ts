import { 
  Topic, 
  TopicApiResponse, 
  TopicCreateRequest, 
  TopicUpdateRequest,
  TopicFilters,
  TopicStats,
  PaginatedTopicResponse,
  TopicPagination,
  ApprovedTopic
} from '../types/topic';

const API_BASE_URL = process.env.TOPIC_API_BASE_URL || 'http://localhost:8083';

class TopicService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/topics`;
  }

  /**
   * Lấy tất cả đề tài với phân trang và bộ lọc
   */
  async getAllTopics(filters?: TopicFilters, page: number = 0, size: number = 10): Promise<{
    topics: Topic[];
    pagination: TopicPagination;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page.toString());
      queryParams.append('size', size.toString());
      
      if (filters?.searchText) {
        queryParams.append('search', filters.searchText);
      }
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      if (filters?.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }
      if (filters?.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder);
      }

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('Get all topics response:', apiResponse); // Debug log
      
      const data = this.extractResponseData(apiResponse);
      
      // Backend returns array of topics directly, not paginated
      if (Array.isArray(data)) {
        return {
          topics: this.mapToTopics(data),
          pagination: {
            page: page,
            size: size,
            total: data.length,
            totalPages: Math.ceil(data.length / size)
          }
        };
      }
      
      // If backend returns paginated response
      if (data.content && data.pagination) {
        return {
          topics: this.mapToTopics(data.content),
          pagination: data.pagination
        };
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Lấy đề tài theo ID
   */
  async getTopicById(id: number): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      const data = this.extractResponseData(apiResponse);
      return this.mapToTopics([data])[0];
    } catch (error) {
      console.error('Error fetching topic by ID:', error);
      throw error;
    }
  }

  /**
   * Tạo đề tài mới
   */
  async createTopic(topicData: TopicCreateRequest): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('Create topic response:', apiResponse); // Debug log
      
      const data = this.extractResponseData(apiResponse);
      return this.mapToTopics([data])[0];
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Tạo đề tài với format đầy đủ (bao gồm submitedAt)
   */
  async createTopicWithSubmission(topicData: {
    title: string;
    description: string;
    submitedAt?: string;
    status?: string;
    filePathUrl?: string;
  }): Promise<Topic> {
    try {
      // Tự động set submitedAt nếu không có và status là PENDING hoặc SUBMITTED
      const requestData: TopicCreateRequest = {
        ...topicData,
        submitedAt: topicData.submitedAt || 
          (['PENDING', 'SUBMITTED'].includes(topicData.status || '') ? 
            new Date().toISOString() : undefined),
        status: topicData.status || 'DRAFT'
      };

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics([data.result as any])[0];
    } catch (error) {
      console.error('Error creating topic with submission:', error);
      throw error;
    }
  }

  /**
   * Tạo topic mẫu theo format request của bạn
   */
  createSampleTopicRequest(): TopicCreateRequest {
    return {
      title: "Ứng dụng AI trong bán hàng",
      description: "Đề tài nghiên cứu về việc ứng dụng trí tuệ nhân tạo trong việc bán hàng.",
      submitedAt: "2025-10-20T10:30:00",
      status: "PENDING",
      filePathUrl: "https://example.com/uploads/topic_ai_traffic.pdf"
    };
  }

  /**
   * Cập nhật đề tài
   */
  async updateTopic(id: number, topicData: TopicUpdateRequest): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics([data.result as any])[0];
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  /**
   * Xóa đề tài
   */
  async deleteTopic(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  /**
   * Nộp đề tài (submit)
   */
  async submitTopic(id: number): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics([data.result as any])[0];
    } catch (error) {
      console.error('Error submitting topic:', error);
      throw error;
    }
  }

  /**
   * Phê duyệt đề tài
   */
  async approveTopic(id: number): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics([data.result as any])[0];
    } catch (error) {
      console.error('Error approving topic:', error);
      throw error;
    }
  }

  /**
   * Từ chối đề tài
   */
  async rejectTopic(id: number, reason?: string): Promise<Topic> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics([data.result as any])[0];
    } catch (error) {
      console.error('Error rejecting topic:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đề tài
   */
  async getTopicStats(): Promise<TopicStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching topic stats:', error);
      throw error;
    }
  }

  /**
   * Upload file cho đề tài
   */
  async uploadTopicFile(id: number, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/${id}/upload`, {
        method: 'POST',
        // Don't set Content-Type for FormData
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result.fileUrl;
    } catch (error) {
      console.error('Error uploading topic file:', error);
      throw error;
    }
  }

  /**
   * Lấy đề tài có sẵn cho hội đồng
   */
  async getAvailableTopics(): Promise<Topic[]> {
    try {
      const response = await fetch(`${this.baseUrl}/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopicApiResponse = await response.json();
      return this.mapToTopics(data.result as any[]);
    } catch (error) {
      console.error('Error fetching available topics:', error);
      throw error;
    }
  }

  async getAllTopicsForReviewCouncil(): Promise<Topic[]> {
    const response = await fetch(`${this.baseUrl}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.status}`);
    }

    const json = await response.json();
    return json.data ?? [];
  }

  async getApprovedTopics(): Promise<ApprovedTopic[]> {
    const response = await fetch(`${this.baseUrl}/approved`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch approved topics: ${response.status}`);
    }

    const data = await response.json();
    return data.data ?? [];
  }


  /**
   * Chuyển đổi dữ liệu từ API response sang Topic
   */
  private mapToTopics(apiData: any[]): Topic[] {
    return apiData.map(item => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      submitedAt: item.submitedAt || null,
      status: item.status || 'DRAFT',
      filePathUrl: item.filePathUrl || null,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
  }

  /**
   * Extract data from API response (handles both 'result' and 'data' fields)
   */
  private extractResponseData(response: any): any {
    // TopicApprovalService uses 'data' field
    if (response.data !== undefined) {
      return response.data;
    }
    // Other services might use 'result' field
    if (response.result !== undefined) {
      return response.result;
    }
    throw new Error('Invalid API response structure');
  }

  /**
   * Format ngày tháng cho hiển thị
   */
  formatDateTime(dateTime: string | null): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format ngày cho hiển thị
   */
  formatDate(dateTime: string | null): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  /**
   * Lấy màu sắc cho status
   */
  getStatusColor(status: string): string {
    const colors = {
      'DRAFT': 'default',
      'PENDING': 'cyan',
      'SUBMITTED': 'blue',
      'UNDER_REVIEW': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'REVISION_REQUIRED': 'yellow',
    };
    return colors[status as keyof typeof colors] || 'default';
  }

  /**
   * Lấy text hiển thị cho status
   */
  getStatusText(status: string): string {
    const texts = {
      'DRAFT': 'Nháp',
      'PENDING': 'Chờ xử lý',
      'SUBMITTED': 'Đã nộp',
      'UNDER_REVIEW': 'Đang xem xét',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'REVISION_REQUIRED': 'Yêu cầu sửa đổi',
    };
    return texts[status as keyof typeof texts] || status;
  }
  /**
   * Kiểm tra có thể chỉnh sửa đề tài không
   */
  canEditTopic(status: string): boolean {
    return ['DRAFT', 'PENDING', 'REVISION_REQUIRED'].includes(status);
  }

  /**
   * Kiểm tra có thể nộp đề tài không
   */
  canSubmitTopic(status: string): boolean {
    return ['DRAFT', 'PENDING', 'REVISION_REQUIRED'].includes(status);
  }

  /**
   * Kiểm tra có thể xóa đề tài không
   */
  canDeleteTopic(status: string): boolean {
    return ['DRAFT', 'PENDING'].includes(status);
  }
}

// Export singleton instance
export const topicService = new TopicService();
export default topicService;