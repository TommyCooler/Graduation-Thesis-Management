const API_BASE_URL = process.env.ACCOUNT_API_BASE_URL || 'http://localhost:8080';

export interface Account {
  id: number;
  email: string;
  name: string;
  lecturerId?: string;
  employeeId?: string;
  role?: string;
}

class AccountService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/account-service/api/accounts`;
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
   * Lấy tất cả tài khoản
   */
  async getAllAccounts(): Promise<Account[]> {
    try {
      const response = await fetch(`${this.baseUrl}/all`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  /**
   * Tìm tài khoản theo email
   */
  async getAccountByEmail(email: string): Promise<Account | null> {
    try {
      const response = await fetch(`${this.baseUrl}/email/${email}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching account by email:', error);
      return null;
    }
  }
}

export const accountService = new AccountService();
