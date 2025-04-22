
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bug, RefreshCw, Send } from "lucide-react";
import { errorService } from "@/utils/errorService";

interface FallbackErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: React.ErrorInfo;
  customMessage?: string;
}

export function FallbackErrorComponent({
  error,
  resetErrorBoundary,
  errorInfo,
  customMessage,
}: FallbackErrorProps) {
  const handleReport = () => {
    errorService.captureError(error, {
      severity: 'high',
      context: {
        componentStack: errorInfo?.componentStack,
        errorInfo
      }
    });
  };

  return (
    <div className="min-h-[400px] p-6 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="mb-2">Something went wrong</AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-sm">{customMessage || error.message}</p>
          
          {process.env.NODE_ENV !== 'production' && errorInfo && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer hover:underline">
                <Bug className="h-3 w-3 inline mr-1" />
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-destructive/10 rounded overflow-auto">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetErrorBoundary}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReport}
            >
              <Send className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
