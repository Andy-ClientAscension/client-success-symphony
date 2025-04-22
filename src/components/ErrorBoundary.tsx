
import React, { ErrorInfo, Component, ReactNode } from 'react';
import { FallbackErrorComponent } from '@/components/FallbackErrorComponent';
import { errorService } from '@/utils/errorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  customMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to error service
    errorService.captureError(error, {
      severity: 'high',
      context: {
        componentStack: errorInfo.componentStack,
        errorInfo
      }
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <FallbackErrorComponent
          error={this.state.error!}
          resetErrorBoundary={this.handleReset}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}
