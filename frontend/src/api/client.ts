import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/queryClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiConfig extends RequestInit {
  requireAuth?: boolean;
}

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiException';
  }
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
      const accessToken = getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Process request through interceptors
    const processedConfig = interceptors.processRequest({
      ...requestConfig,
      headers,
      url,
      requireAuth
    });

    try {
      const response = await fetch(processedConfig.url, {
        ...processedConfig,
        headers: processedConfig.headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && requireAuth) {
        try {
          // Try to refresh token
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Make refresh request
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (!refreshResponse.ok) {
            throw new Error('Token refresh failed');
          }
          
          const refreshData = await refreshResponse.json();
          setTokens(refreshData.access_token, refreshData.refresh_token);
          
          // Retry the original request with new token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshData.access_token}`
          };
          const retryResponse = await fetch(url, {
            ...requestConfig,
            headers: retryHeaders,
          });
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({ error: 'Request failed after token refresh' }));
            const error = new ApiException(
              errorData.error || 'Request failed after token refresh',
              retryResponse.status,
              errorData.code,
              errorData.details
            );
            interceptors.processError(error, processedConfig);
            throw error;
          }
          
          const retryData = await retryResponse.json();
          const processedRetryData = interceptors.processResponse(retryData, processedConfig);
          return this.extractResponseData(processedRetryData);
        } catch (error) {
          // Refresh failed, clear tokens
          clearTokens();
          window.location.href = '/auth/login';
          const apiError = new ApiException('Session expired, please login again', 401);
          interceptors.processError(apiError, processedConfig);
          throw apiError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        const error = new ApiException(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
        interceptors.processError(error, processedConfig);
        throw error;
      }

      const responseData = await response.json();
      const processedData = interceptors.processResponse(responseData, processedConfig);
      
      return this.extractResponseData(processedData);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      const apiError = error instanceof Error 
        ? new ApiException(error.message, 0)
        : new ApiException('Network error occurred', 0);
      interceptors.processError(apiError, processedConfig);
      throw apiError;
    }
  }

  private extractResponseData<T>(responseData: any): T {
    // Check if response is in the expected format
    if (responseData && typeof responseData === 'object') {
      // If response has 'data' property, return the data
      if ('data' in responseData) {
        return responseData.data;
      }
      // Otherwise return the whole response
      return responseData;
    }
    
    return responseData;
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

// Request interceptor type
type RequestInterceptor = (config: ApiConfig & { url: string }) => ApiConfig & { url: string };

// Response interceptor type
type ResponseInterceptor = <T>(response: T, config: ApiConfig & { url: string }) => T;

// Error interceptor type
type ErrorInterceptor = (error: ApiException, config: ApiConfig & { url: string }) => void;

// Interceptor management
class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  processRequest(config: ApiConfig & { url: string }): ApiConfig & { url: string } {
    return this.requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
  }

  processResponse<T>(response: T, config: ApiConfig & { url: string }): T {
    return this.responseInterceptors.reduce((acc, interceptor) => interceptor(acc, config), response);
  }

  processError(error: ApiException, config: ApiConfig & { url: string }): void {
    this.errorInterceptors.forEach(interceptor => interceptor(error, config));
  }
}

export const interceptors = new InterceptorManager();

// Add default request interceptor for logging
interceptors.addRequestInterceptor((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
  }
  return config;
});

// Add default response interceptor for logging
interceptors.addResponseInterceptor((response, config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ API Response: ${config.method?.toUpperCase() || 'GET'} ${config.url}`, response);
  }
  return response;
});

// Add default error interceptor for logging
interceptors.addErrorInterceptor((error, config) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ API Error: ${config.method?.toUpperCase() || 'GET'} ${config.url}`, error);
  }
  
  // You can add global error handling here
  // For example, show toast notifications for certain error types
});

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
  
  // Upload endpoints (for file uploads)
  upload: {
    post: <T>(endpoint: string, formData: FormData) => 
      apiClient.post<T>(endpoint, formData, { 
        requireAuth: true, 
        headers: {} // Remove Content-Type to let browser set it with boundary
      }),
  },
};
