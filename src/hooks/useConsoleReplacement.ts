import React from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { handleError } from '@/services/errorService';

interface ErrorReplacementProps {
  component: string;
  action: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
}

// Component to replace console.log calls with proper error handling
export function useConsoleReplacement() {
  const { logInfo, logWarning, logError, logDebug } = useErrorHandler();

  const logWithContext = React.useCallback((
    message: string, 
    level: 'info' | 'warn' | 'error' | 'debug' = 'info',
    context?: { component?: string; action?: string; metadata?: Record<string, unknown> }
  ) => {
    switch (level) {
      case 'error':
        if (context) {
          handleError(new Error(message), context);
        } else {
          logError(message);
        }
        break;
      case 'warn':
        logWarning(message);
        break;
      case 'debug':
        logDebug(message);
        break;
      default:
        logInfo(message);
        break;
    }
  }, [logInfo, logWarning, logError, logDebug]);

  return { logWithContext };
}