// API Service Layer - Standardized patterns for all API interactions
// This replaces scattered API patterns with a consistent approach

import { errorService } from './error-service';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: Array<(config: ApiRequestConfig) => ApiRequestConfig> = [];
  private responseInterceptors: Array<(response: ApiResponse) => ApiResponse> = [];

  constructor(baseURL = '/api', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: ApiResponse) => ApiResponse): void {
    this.responseInterceptors.push(interceptor);
  }

  // Main request method
  async request<T = any>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 0,
      retryDelay = 1000,
      signal
    } = config;

    // Apply request interceptors
    let finalConfig: ApiRequestConfig & { headers: Record<string, string> } = { 
      ...config, 
      headers: { ...this.defaultHeaders, ...headers } 
    };
    this.requestInterceptors.forEach(interceptor => {
      finalConfig = { ...finalConfig, ...interceptor(finalConfig) };
    });

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Create abort controller if timeout is specified
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort('Request timeout'), timeout);
    
    // Use provided signal or our timeout signal
    const requestSignal = signal || abortController.signal;

    let lastError: Error;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fetchConfig: RequestInit = {
          method,
          headers: finalConfig.headers,
          signal: requestSignal
        };

        if (body && method !== 'GET') {
          fetchConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(fullUrl, fetchConfig);
        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse response
        let data: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as any;
        }

        // Build response object
        let apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };

        // Apply response interceptors
        this.responseInterceptors.forEach(interceptor => {
          apiResponse = interceptor(apiResponse);
        });

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort
        if (lastError.name === 'AbortError') {
          break;
        }
        
        // If this isn't the last attempt, wait and retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
    }

    clearTimeout(timeoutId);
    
    // Handle the final error
    const apiError: ApiError = {
      message: lastError!.message,
      status: 0,
      code: 'NETWORK_ERROR'
    };

    errorService.handleError(lastError!, {
      component: 'ApiService',
      action: 'request',
      metadata: { url: fullUrl, method, attempt: retries + 1 }
    });

    throw apiError;
  }

  // Convenience methods
  async get<T = any>(url: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'GET' });
    return response.data;
  }

  async post<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'POST', body });
    return response.data;
  }

  async put<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'PUT', body });
    return response.data;
  }

  async patch<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'PATCH', body });
    return response.data;
  }

  async delete<T = any>(url: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    const response = await this.request<T>(url, { ...config, method: 'DELETE' });
    return response.data;
  }

  // Paginated request helper
  async getPaginated<T = any>(
    url: string,
    params: { page?: number; limit?: number; [key: string]: any } = {},
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const fullUrl = `${url}?${queryParams.toString()}`;
    return await this.get<PaginatedResponse<T>>(fullUrl, config);
  }

  // File upload helper
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName = 'file',
    additionalFields: Record<string, string> = {},
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Don't set Content-Type header for FormData - let browser set it
    const finalConfig: ApiRequestConfig = {
      timeout: 30000, // Longer timeout for file uploads
      retries: 1,
      ...config,
      method: 'POST',
      body: formData,
      headers: { ...config?.headers }
    };
    
    // Remove Content-Type to let browser set it for FormData
    if (finalConfig.headers && 'Content-Type' in finalConfig.headers) {
      delete finalConfig.headers['Content-Type'];
    }

    const response = await this.request<T>(url, finalConfig);

    return response.data;
  }
}

// Create and export default instance
export const apiService = new ApiService();

// Export class for creating custom instances
export { ApiService };

// Auth interceptor helper
export function addAuthInterceptor(getToken: () => string | null): void {
  apiService.addRequestInterceptor((config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  });
}

// Error response interceptor helper
export function addErrorInterceptor(
  onUnauthorized?: () => void,
  onForbidden?: () => void,
  onServerError?: () => void
): void {
  apiService.addResponseInterceptor((response) => {
    switch (response.status) {
      case 401:
        onUnauthorized?.();
        break;
      case 403:
        onForbidden?.();
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        onServerError?.();
        break;
    }
    return response;
  });
}