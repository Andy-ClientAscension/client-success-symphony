
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  showRetry?: boolean;
}

export function ChartErrorFallback({ 
  error, 
  resetErrorBoundary,
  title = "Chart Error", 
  showRetry = true 
}: ErrorFallbackProps) {
  return (
    <div className="w-full h-full min-h-[200px] rounded-md border border-muted bg-muted/10 p-4 flex flex-col items-center justify-center">
      <Alert variant="destructive" className="max-w-md mx-auto bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {error.message || "Failed to load chart data"}
        </AlertDescription>
      </Alert>
      
      {showRetry && resetErrorBoundary && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4" 
          onClick={resetErrorBoundary}
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function TableErrorFallback({ 
  error, 
  resetErrorBoundary,
  title = "Data Loading Error", 
  showRetry = true 
}: ErrorFallbackProps) {
  return (
    <div className="w-full rounded-md border border-muted p-6 flex flex-col items-center justify-center">
      <Alert variant="destructive" className="max-w-lg mx-auto bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {error.message || "Failed to load data"}
          <p className="mt-1 text-xs opacity-70">
            Try refreshing the page or check your network connection.
          </p>
        </AlertDescription>
      </Alert>
      
      {showRetry && resetErrorBoundary && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4" 
          onClick={resetErrorBoundary}
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          Reload Data
        </Button>
      )}
    </div>
  );
}

export function MetricErrorFallback({ 
  error, 
  resetErrorBoundary,
  title = "Metrics Error", 
  showRetry = true 
}: ErrorFallbackProps) {
  return (
    <div className="w-full rounded-md border border-muted p-4 flex flex-col items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "Unable to load metrics"}
        </p>
        
        {showRetry && resetErrorBoundary && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2" 
            onClick={resetErrorBoundary}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
