// Centralized error handling service for the application
// This replaces scattered error handling patterns with a consistent approach

import { safeLogger } from '@/utils/code-quality-fixes';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AppError extends Error {
  code?: string;
  context?: ErrorContext;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recoverable?: boolean;
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  throwError?: boolean;
  recoveryActions?: ErrorRecoveryAction[];
}

class ErrorService {
  private errorQueue: AppError[] = [];
  private errorCallbacks: Array<(error: AppError) => void> = [];
  private maxQueueSize = 100;

  // Create a standardized error
  createError(
    message: string,
    options: {
      code?: string;
      context?: ErrorContext;
      severity?: AppError['severity'];
      recoverable?: boolean;
      cause?: Error;
    } = {}
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = options.code;
    error.context = {
      severity: 'medium',
      ...options.context
    };
    error.timestamp = new Date();
    error.severity = options.severity || 'medium';
    error.recoverable = options.recoverable ?? true;
    
    if (options.cause) {
      // Store cause in metadata instead of direct property
      error.context = {
        ...error.context,
        metadata: {
          ...error.context?.metadata,
          cause: options.cause.message
        }
      };
    }

    return error;
  }

  // Handle errors with configurable options
  handleError(
    error: Error | AppError | string,
    context?: ErrorContext,
    options: ErrorHandlerOptions = {}
  ): void {
    const {
      showToast = true,
      logError = true,
      throwError = false,
      recoveryActions = []
    } = options;

    // Normalize the error
    const appError = this.normalizeError(error, context);
    
    // Log the error if enabled
    if (logError) {
      this.logError(appError);
    }
    
    // Queue for processing
    this.queueError(appError);
    
    // Notify callbacks (for toast notifications, analytics, etc.)
    this.notifyCallbacks(appError);
    
    // Throw if requested (for error boundaries)
    if (throwError) {
      throw appError;
    }
  }

  // Async operation wrapper with error handling
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    options: ErrorHandlerOptions & {
      fallbackValue?: T;
      retries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T | undefined> {
    const { fallbackValue, retries = 0, retryDelay = 1000, ...errorOptions } = options;
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // If this isn't the last attempt, wait and retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Handle the final error
        this.handleError(lastError, context, errorOptions);
        return fallbackValue;
      }
    }
  }

  // Sync operation wrapper with error handling
  withSyncErrorHandling<T>(
    operation: () => T,
    context?: ErrorContext,
    options: ErrorHandlerOptions & { fallbackValue?: T } = {}
  ): T | undefined {
    const { fallbackValue, ...errorOptions } = options;
    
    try {
      return operation();
    } catch (error) {
      this.handleError(error as Error, context, errorOptions);
      return fallbackValue;
    }
  }

  // Subscribe to error events
  onError(callback: (error: AppError) => void): () => void {
    this.errorCallbacks.push(callback);
    
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Get recent errors
  getRecentErrors(count = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = [];
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    recent: AppError[];
  } {
    const bySeverity: Record<string, number> = {};
    const byComponent: Record<string, number> = {};
    
    this.errorQueue.forEach(error => {
      const severity = error.severity || 'medium';
      const component = error.context?.component || 'unknown';
      
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      byComponent[component] = (byComponent[component] || 0) + 1;
    });
    
    return {
      total: this.errorQueue.length,
      bySeverity,
      byComponent,
      recent: this.getRecentErrors(5)
    };
  }

  // Private methods
  private normalizeError(error: Error | AppError | string, context?: ErrorContext): AppError {
    let appError: AppError;
    
    if (typeof error === 'string') {
      appError = this.createError(error, { context });
    } else if (this.isAppError(error)) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      appError = error;
    } else {
      appError = error as AppError;
      appError.context = context;
      appError.timestamp = new Date();
      appError.severity = 'medium';
      appError.recoverable = true;
    }
    
    return appError;
  }

  private isAppError(error: Error): error is AppError {
    return 'context' in error || 'severity' in error;
  }

  private logError(error: AppError): void {
    const logMessage = `[${error.severity?.toUpperCase()}] ${error.message}`;
    const logContext = {
      code: error.code,
      component: error.context?.component,
      action: error.context?.action,
      timestamp: error.timestamp?.toISOString(),
      metadata: error.context?.metadata,
      stack: error.stack
    };

    switch (error.severity) {
      case 'critical':
        safeLogger.error(logMessage, logContext);
        break;
      case 'high':
        safeLogger.error(logMessage, logContext);
        break;
      case 'medium':
        safeLogger.warn(logMessage, logContext);
        break;
      case 'low':
      default:
        safeLogger.info(logMessage, logContext);
        break;
    }
  }

  private queueError(error: AppError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  private notifyCallbacks(error: AppError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        safeLogger.error('Error in error callback:', err);
      }
    });
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Convenience functions
export const createError = errorService.createError.bind(errorService);
export const handleError = errorService.handleError.bind(errorService);
export const withErrorHandling = errorService.withErrorHandling.bind(errorService);
export const withSyncErrorHandling = errorService.withSyncErrorHandling.bind(errorService);
export const onError = errorService.onError.bind(errorService);

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError,
    withErrorHandling,
    withSyncErrorHandling,
    createError,
    onError
  };
}