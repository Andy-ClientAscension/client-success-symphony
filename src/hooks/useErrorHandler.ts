import { useCallback } from 'react';
import { safeLogger } from '@/utils/code-quality-fixes';

// Replace direct console usage with centralized error handling
export function useErrorHandler() {
  const logInfo = useCallback((message: string, ...args: unknown[]) => {
    safeLogger.info(message, ...args);
  }, []);

  const logWarning = useCallback((message: string, ...args: unknown[]) => {
    safeLogger.warn(message, ...args);
  }, []);

  const logError = useCallback((message: string, ...args: unknown[]) => {
    safeLogger.error(message, ...args);
  }, []);

  const logDebug = useCallback((message: string, ...args: unknown[]) => {
    safeLogger.debug(message, ...args);
  }, []);

  return {
    logInfo,
    logWarning,
    logError,
    logDebug
  };
}