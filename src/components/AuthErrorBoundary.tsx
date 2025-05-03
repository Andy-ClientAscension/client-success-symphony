
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ValidationError } from '@/components/ValidationError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Auth error caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 mx-auto max-w-md mt-8">
          <ValidationError 
            type="error"
            title="Authentication Error"
            message={this.state.error?.message || "An authentication error occurred"}
            showIcon
            className="mb-4"
          />
          <p className="text-sm text-gray-600 mb-4">
            Please try refreshing the page or signing out and back in again.
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
