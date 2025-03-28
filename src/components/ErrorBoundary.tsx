
import React, { ErrorInfo, Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle } from "lucide-react";
import { ValidationError } from './ValidationError';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
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
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    // Call the onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
    // Reset the error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  renderErrorDetails() {
    const { error, errorInfo } = this.state;
    
    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto text-xs max-h-[200px]">
        <p className="font-semibold">Error: {error?.message || "Unknown error"}</p>
        {errorInfo && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500 hover:text-blue-600">Stack trace</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
          <Alert className="max-w-md">
            <XCircle className="h-4 w-4 text-destructive mr-2" />
            <AlertTitle className="mb-2">Something went wrong</AlertTitle>
            <AlertDescription className="mb-4">
              {this.state.error?.message || "An unexpected error occurred."}
            </AlertDescription>
            
            {process.env.NODE_ENV !== 'production' && this.renderErrorDetails()}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
