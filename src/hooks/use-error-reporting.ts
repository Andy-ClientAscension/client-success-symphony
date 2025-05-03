
import { useState, useCallback } from "react";
import { errorService } from "@/utils/error";

export function useErrorReporting() {
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [contextInfo, setContextInfo] = useState<{
    context?: string;
    additionalInfo?: Record<string, any>;
  }>({});
  
  const reportError = useCallback((
    error: Error | unknown,
    options: {
      context?: string;
      additionalInfo?: Record<string, any>;
      showReportDialog?: boolean;
    } = {}
  ) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Always log the error via the error service
    errorService.captureError(errorObj, {
      severity: options.context?.includes("critical") ? "critical" : "high",
      context: {
        location: options.context,
        ...options.additionalInfo
      }
    });
    
    // Open the reporting dialog if requested
    if (options.showReportDialog !== false) {
      setCurrentError(errorObj);
      setContextInfo({
        context: options.context,
        additionalInfo: options.additionalInfo
      });
      setIsReportingOpen(true);
    }
    
    return errorObj;
  }, []);
  
  const closeReporting = useCallback(() => {
    setIsReportingOpen(false);
  }, []);
  
  return {
    reportError,
    isReportingOpen,
    currentError,
    contextInfo,
    closeReporting
  };
}
