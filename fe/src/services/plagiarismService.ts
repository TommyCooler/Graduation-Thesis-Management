const API_BASE_URL = process.env.NEXT_PUBLIC_PLAGIARISM_API_BASE_URL || 'http://localhost:8080';

export interface PlagiarismCheckResponse {
  status: string;
  message: string;
  data: {
    fileUrl: string;
    n8nResponse: any;
  };
}

class PlagiarismService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/plagiarism-service/api/plagiarism`;
  }

  /**
   * Helper function to get auth headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
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
   * Kiểm tra đạo văn cho file
   */
  async checkPlagiarism(
    file: File, 
    topicId: number, 
  ): Promise<PlagiarismCheckResponse> {
    try {
      console.log('PlagiarismService.checkPlagiarism called with:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        topicId,
      });

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('FormData created, checking file in FormData:', formData.get('file'));
      
      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/send`);
      url.searchParams.append('topicId', topicId.toString());

      console.log('Sending POST request to:', url.toString());

      // Get auth headers but remove Content-Type for FormData
      const headers = this.getAuthHeaders() as Record<string, string>;
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
      delete headers['Content-Type'];

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: formData,
      });

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Plagiarism check successful:', data);
      return data;
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      throw error;
    }
  }

  /**
   * Xóa topic khỏi Qdrant
   */
  async deleteTopicFromQdrant(topicId: number): Promise<PlagiarismCheckResponse> {
    try {
      console.log('PlagiarismService.deleteTopicFromQdrant called with topicId:', topicId);
      
      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/delete-topic-qdrant`);
      url.searchParams.append('topicId', topicId.toString());

      console.log('Sending POST request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Delete topic from Qdrant successful:', data);
      return data;
    } catch (error) {
      console.error('Error deleting topic from Qdrant:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra health của service
   */
  async checkHealth(): Promise<{ status: string; message: string; data: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking plagiarism service health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const plagiarismService = new PlagiarismService();
export default plagiarismService;

