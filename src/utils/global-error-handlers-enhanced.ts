import { errorService } from '@/shared/services/error-service';
import { safeLogger } from '@/utils/code-quality-fixes';

interface GlobalErrorContext {
  userAgent: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class GlobalErrorHandler {
  private isSetup = false;
  private errorCount = 0;
  private readonly MAX_ERRORS_PER_SESSION = 50;

  setup() {
    if (this.isSetup || typeof window === 'undefined') return;

    this.setupUnhandledRejectionHandler();
    this.setupGlobalErrorHandler();
    this.setupResourceErrorHandler();
    this.isSetup = true;
    
    safeLogger.info('Global error handlers initialized');
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      if (this.shouldIgnoreError(event.reason)) return;
      
      this.errorCount++;
      if (this.errorCount > this.MAX_ERRORS_PER_SESSION) return;

      const context = this.createErrorContext();
      
      errorService.handleError(
        event.reason || 'Unhandled promise rejection',
        {
          component: 'Global',
          action: 'unhandledrejection',
          severity: 'high',
          metadata: { 
            ...context,
            promiseRejection: true,
            errorCount: this.errorCount
          }
        },
        {
          showToast: false, // Don't spam user with unhandled rejections
          logError: true
        }
      );

      // Prevent default console error in production
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }
    });
  }

  private setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      if (this.shouldIgnoreError(event.error)) return;
      
      this.errorCount++;
      if (this.errorCount > this.MAX_ERRORS_PER_SESSION) return;

      const context = this.createErrorContext();
      
      errorService.handleError(
        event.error || event.message || 'Global JavaScript error',
        {
          component: 'Global',
          action: 'javascript_error',
          severity: 'high',
          metadata: {
            ...context,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            errorCount: this.errorCount
          }
        },
        {
          showToast: false,
          logError: true
        }
      );
    });
  }

  private setupResourceErrorHandler() {
    window.addEventListener('error', (event) => {
      // Handle resource loading errors (images, scripts, etc.)
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        const resourceType = target.tagName?.toLowerCase();
        const resourceSrc = (target as any).src || (target as any).href;

        if (resourceType && resourceSrc) {
          errorService.handleError(
            `Failed to load ${resourceType}: ${resourceSrc}`,
            {
              component: 'ResourceLoader',
              action: 'resource_error',
              severity: 'medium',
              metadata: {
                resourceType,
                resourceSrc,
                ...this.createErrorContext()
              }
            },
            {
              showToast: false,
              logError: true
            }
          );
        }
      }
    }, true); // Use capture phase for resource errors
  }

  private createErrorContext(): GlobalErrorContext {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // Check localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.id || parsedUser.userId;
      }
      
      // Check sessionStorage
      const session = sessionStorage.getItem('session');
      if (session) {
        const parsedSession = JSON.parse(session);
        return parsedSession.userId;
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return undefined;
    }
  }

  private shouldIgnoreError(error: any): boolean {
    if (!error) return true;
    
    const message = error.message || error.toString();
    
    // Ignore common non-actionable errors
    const ignoredPatterns = [
      /script error/i,
      /non-error promise rejection captured/i,
      /loading chunk \d+ failed/i,
      /networkError/i,
      /cancelled/i,
      /AbortError/i
    ];

    return ignoredPatterns.some(pattern => pattern.test(message));
  }

  getErrorStats() {
    return {
      errorCount: this.errorCount,
      maxErrors: this.MAX_ERRORS_PER_SESSION,
      isSetup: this.isSetup
    };
  }

  reset() {
    this.errorCount = 0;
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

// React hook for setting up global error handlers
export function useGlobalErrorHandlers() {
  const { useEffect } = require('react');
  useEffect(() => {
    globalErrorHandler.setup();
  }, []);
}

// Standalone setup function
export function setupGlobalErrorHandlers() {
  globalErrorHandler.setup();
}