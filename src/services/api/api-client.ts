import { errorService, type ErrorState } from "@/utils/error";
import { corsHeaders, withCorsHeaders } from "@/utils/corsHeaders";

interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  silentError?: boolean;
}

const DEFAULT_OPTIONS: ApiClientOptions = {
  baseUrl: '',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders
  }
};

/**
 * Enhanced fetch API client with retry, timeout, and error handling
 */
class ApiClient {
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Add authorization header to requests when user is authenticated
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.options.headers = {
        ...this.options.headers,
        'Authorization': `Bearer ${token}`
      };
    } else {
      // Remove Authorization header if token is null
      const { Authorization, ...restHeaders } = this.options.headers || {};
      this.options.headers = restHeaders;
    }
  }

  /**
   * Main request method with retries and error handling
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.options.baseUrl}${endpoint}`;
    
    const {
      timeout = this.options.timeout,
      retries = this.options.retries,
      retryDelay = this.options.retryDelay,
      silentError = false,
      ...fetchConfig
    } = config;

    // Merge default headers with request-specific headers - fixed type handling
    const mergedHeaders: Record<string, string> = {
      ...this.options.headers,
      ...(fetchConfig.headers as Record<string, string> || {})
    };
    
    // Use the withCorsHeaders helper for proper typing
    const headers = withCorsHeaders(mergedHeaders);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < (retries || 1); attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = timeout 
          ? setTimeout(() => controller.abort(), timeout)
          : null;

        const response = await fetch(url, {
          ...fetchConfig,
          headers,
          signal: controller.signal,
          mode: 'cors',
          credentials: 'include'
        });

        // Clear timeout if request completes
        if (timeoutId) clearTimeout(timeoutId);

        // Check if response is ok (status in the range 200-299)
        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage: string;
          
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorJson.error || `API Error: ${response.status}`;
          } catch {
            errorMessage = errorBody || `HTTP Error: ${response.status} ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        // For 204 No Content responses, return empty object
        if (response.status === 204) {
          return {} as T;
        }

        // Handle different content types
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json() as T;
        } else {
          // Return text for non-JSON responses
          const text = await response.text();
          return text as unknown as T;
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Skip retries for certain error types
        const errorType = errorService.detectErrorType(error);
        if (errorType === 'auth' || 
           (error instanceof DOMException && error.name === 'AbortError') ||
           attempt === retries! - 1) {
          break;
        }
        
        // Wait before retrying
        if (attempt < (retries! - 1)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay! * (attempt + 1)));
        }
      }
    }
    
    // If we got here, all retry attempts failed
    if (!silentError) {
      errorService.handleNetworkError(lastError!, { 
        context: { endpoint, method: fetchConfig.method || 'GET' }
      });
    }
    
    throw lastError;
  }

  /**
   * HTTP GET request
   */
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    });
  }

  /**
   * HTTP POST request
   */
  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * HTTP PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient();

/**
 * Create a wrapper to handle API responses with loading and error states
 */
export async function apiRequest<T>(
  requestFn: () => Promise<T>,
  options: { 
    onSuccess?: (data: T) => void,
    onError?: (error: ErrorState) => void,
    errorMessage?: string
  } = {}
): Promise<{ data: T | null; isLoading: boolean; error: ErrorState | null }> {
  try {
    const data = await requestFn();
    options.onSuccess?.(data);
    return { data, isLoading: false, error: null };
  } catch (error) {
    const errorState = errorService.createErrorState(error, options.errorMessage);
    options.onError?.(errorState);
    return { data: null, isLoading: false, error: errorState };
  }
}
