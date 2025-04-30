
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { errorService, type ErrorState } from "@/utils/error";
import { corsHeaders } from "@/utils/corsHeaders";
import { toast } from "@/hooks/use-toast";

// API client configuration options
export interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

// Request configuration with additional options
export interface ApiRequestConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
  silentError?: boolean;
}

// Response with metadata
export interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: ErrorState | null;
}

// Default configuration
const DEFAULT_OPTIONS: ApiClientOptions = {
  baseURL: '',
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders
  }
};

/**
 * Core API client with retry logic and error handling
 */
export class ApiCore {
  private instance: AxiosInstance;
  private options: ApiClientOptions;

  constructor(options: Partial<ApiClientOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    this.instance = axios.create({
      baseURL: this.options.baseURL,
      timeout: this.options.timeout,
      headers: this.options.headers
    });

    // Add response interceptor for global error handling
    this.instance.interceptors.response.use(
      (response) => response,
      this.handleErrorInterceptor.bind(this)
    );
  }

  /**
   * Update authorization token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Error interceptor with retry logic
   */
  private async handleErrorInterceptor(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as ApiRequestConfig & { _retryCount?: number };
    
    // Initialize retry count
    if (config._retryCount === undefined) {
      config._retryCount = 0;
    }

    const retries = config.retries ?? this.options.retries ?? DEFAULT_OPTIONS.retries;
    const retryDelay = config.retryDelay ?? this.options.retryDelay ?? DEFAULT_OPTIONS.retryDelay;

    // Check if we should retry the request
    const shouldRetry = 
      config._retryCount < retries! && 
      (!error.response || (error.response.status >= 500 || error.response.status === 429));
    
    if (shouldRetry) {
      config._retryCount++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay! * config._retryCount));
      
      // Retry the request
      return this.instance(config);
    }

    // If we've exhausted retries or shouldn't retry, reject with the error
    return Promise.reject(error);
  }

  /**
   * Main request method
   */
  async request<T>(config: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<T>(config);
      return response.data;
    } catch (error) {
      const { silentError = false } = config;
      
      if (!silentError) {
        // Use our error service to handle the error properly
        errorService.handleNetworkError(error, { 
          context: { endpoint: config.url, method: config.method || 'GET' }
        });
      }
      
      throw error;
    }
  }

  /**
   * HTTP GET request
   */
  async get<T>(url: string, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  /**
   * HTTP POST request
   */
  async post<T>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  /**
   * HTTP PUT request
   */
  async put<T>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(url: string, config: ApiRequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }
}

// Create and export the default API client instance
export const apiCore = new ApiCore();

/**
 * Wrapper for handling API requests with loading and error states
 */
export async function executeApiRequest<T>(
  requestFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: ErrorState) => void;
    errorMessage?: string;
  } = {}
): Promise<ApiResponse<T>> {
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
