import React, { ErrorInfo, Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { logError } from '@/utils/errorLogger';
import { logDetailedError } from '@/utils/errorHandling';
import { setupErrorTesting } from '@/utils/errorTesting';

// Initialize error testing utilities in development
if (process.env.NODE_ENV === 'development') {
  setupErrorTesting();
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  customMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    console.log("ErrorBoundary constructed");
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("ErrorBoundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary componentDidCatch:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    
    logError(error, {
      componentStack: errorInfo.componentStack,
      ...errorInfo
    });
    
    logDetailedError(error, `Error boundary caught error: ${errorInfo.componentStack}`);
  }

  componentDidMount() {
    console.log("ErrorBoundary mounted");
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    console.log("ErrorBoundary updated", { 
      hasErrorChanged: prevState.hasError !== this.state.hasError,
      currentError: this.state.error?.message || "None"
    });
  }

  handleReset = (): void => {
    console.log("ErrorBoundary reset requested");
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  renderErrorDetails() {
    const { error, errorInfo } = this.state;
    
    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto text-xs max-h-[200px]">
        <p className="font-semibold">Error: {error?.message || "Unknown error"}</p>
        {errorInfo && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500 hover:text-blue-600">Technical details</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    );
  }

  render(): ReactNode {
    console.log("ErrorBoundary rendering, hasError:", this.state.hasError);
    
    if (this.state.hasError) {
      console.log("ErrorBoundary rendering error state");
      
      // First, check if a custom fallback was provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, render the default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4" role="alert">
          <Alert className="max-w-md">
            <AlertTitle className="mb-2">Dashboard Section Unavailable</AlertTitle>
            <AlertDescription className="mb-4">
              {this.props.customMessage || "An unexpected error occurred. Please try refreshing."}
            </AlertDescription>
            
            {process.env.NODE_ENV !== 'production' && this.renderErrorDetails()}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Alert>
        </div>
      );
    }

    console.log("ErrorBoundary rendering children");
    return this.props.children;
  }
}
