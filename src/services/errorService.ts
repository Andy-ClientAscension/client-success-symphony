import { safeLogger } from '@/utils/code-quality-fixes';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AppError extends Error {
  code?: string;
  context?: ErrorContext;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorService {
  private errorQueue: AppError[] = [];
  private errorCallbacks: Array<(error: AppError) => void> = [];

  // Standardized error creation
  createError(
    message: string, 
    code?: string, 
    context?: ErrorContext,
    severity: AppError['severity'] = 'medium'
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.context = context;
    error.timestamp = new Date();
    error.severity = severity;
    return error;
  }

  // Log and handle errors consistently
  handleError(error: Error | AppError, context?: ErrorContext): void {
    const appError = this.normalizeError(error, context);
    
    // Log the error
    this.logError(appError);
    
    // Queue for processing
    this.queueError(appError);
    
    // Notify callbacks
    this.notifyCallbacks(appError);
  }

  // Normalize any error to AppError
  private normalizeError(error: Error | AppError, context?: ErrorContext): AppError {
    if (this.isAppError(error)) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      return error;
    }

    const appError = error as AppError;
    appError.context = context;
    appError.timestamp = new Date();
    appError.severity = 'medium';
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
      metadata: error.context?.metadata
    };

    switch (error.severity) {
      case 'critical':
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
    
    // Keep queue size manageable
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50);
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

  // Subscribe to error events
  onError(callback: (error: AppError) => void): () => void {
    this.errorCallbacks.push(callback);
    
    // Return unsubscribe function
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

  // Async error wrapper
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }

  // Sync error wrapper
  withSyncErrorHandling<T>(
    operation: () => T,
    context?: ErrorContext,
    fallbackValue?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Convenience functions
export const createError = errorService.createError.bind(errorService);
export const handleError = errorService.handleError.bind(errorService);
export const withErrorHandling = errorService.withErrorHandling.bind(errorService);
export const withSyncErrorHandling = errorService.withSyncErrorHandling.bind(errorService);
