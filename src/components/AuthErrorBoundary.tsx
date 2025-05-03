
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

  getErrorTypeFromMessage(errorMessage: string): string {
    if (errorMessage.includes('network') || errorMessage.includes('offline') || errorMessage.includes('failed to fetch')) {
      return 'network';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'verification';
    }
    if (errorMessage.includes('rate limit')) {
      return 'rate-limit';
    }
    return 'auth';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const errorMessage = this.state.error?.message || "An authentication error occurred";
      const errorType = this.getErrorTypeFromMessage(errorMessage);
      let instructions = "Please try refreshing the page or signing out and back in again.";
      
      if (errorType === 'network') {
        instructions = "Please check your internet connection and try again.";
      } else if (errorType === 'verification') {
        instructions = "Please check your email inbox and follow the verification link.";
      } else if (errorType === 'rate-limit') {
        instructions = "You've made too many attempts. Please wait a few minutes before trying again.";
      }
      
      return (
        <div className="p-4 mx-auto max-w-md mt-8">
          <ValidationError 
            type="error"
            title="Authentication Error"
            message={errorMessage}
            showIcon
            className="mb-4"
          />
          <p className="text-sm text-gray-600 mb-4">
            {instructions}
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            
            {errorType === 'network' && (
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
