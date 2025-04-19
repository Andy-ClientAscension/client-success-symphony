
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  description?: string;
}

export function GenericErrorFallback({
  error,
  resetErrorBoundary,
  title = "Component Error",
  description,
}: ErrorFallbackProps) {
  return (
    <div className="p-4" role="alert">
      <Alert variant="destructive">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {description || error.message}
        </AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetErrorBoundary}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </Alert>
    </div>
  );
}

export function MetricsErrorFallback(props: ErrorFallbackProps) {
  return (
    <GenericErrorFallback
      {...props}
      title="Metrics Loading Error"
      description="Unable to load metrics data. Please try again."
    />
  );
}

export function ChartErrorFallback(props: ErrorFallbackProps) {
  return (
    <GenericErrorFallback
      {...props}
      title="Chart Loading Error"
      description="Unable to load chart data. Please try again."
    />
  );
}

export function TableErrorFallback(props: ErrorFallbackProps) {
  return (
    <GenericErrorFallback
      {...props}
      title="Table Loading Error"
      description="Unable to load table data. Please try again."
    />
  );
}
