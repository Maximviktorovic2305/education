import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiConfig extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const { requireAuth = false, ...requestConfig } = config;
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestConfig.headers as Record<string, string> || {}),
    };

    // Add authorization header if required
    if (requireAuth) {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...requestConfig,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && requireAuth) {
        const { refreshAccessToken, logout } = useAuthStore.getState();
        
        try {
          // Try to refresh token
          await refreshAccessToken();
          
          // Retry the original request with new token
          const { accessToken: newToken } = useAuthStore.getState();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, {
              ...requestConfig,
              headers,
            });
            
            if (!retryResponse.ok) {
              throw new Error('Request failed after token refresh');
            }
            
            return retryResponse.json();
          }
        } catch (error) {
          // Refresh failed, logout user
          logout();
          throw new Error('Session expired, please login again');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // GET request
  async get<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown, config: ApiConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown, config: ApiConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown, config: ApiConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_URL);

// Convenience methods for common patterns
export const api = {
  // Public endpoints (no auth required)
  public: {
    get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
    post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),
  },
  
  // Protected endpoints (auth required)
  protected: {
    get: <T>(endpoint: string) => apiClient.get<T>(endpoint, { requireAuth: true }),
    post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data, { requireAuth: true }),
    put: <T>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data, { requireAuth: true }),
    patch: <T>(endpoint: string, data?: unknown) => apiClient.patch<T>(endpoint, data, { requireAuth: true }),
    delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint, { requireAuth: true }),
  },
};