import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  showDetails?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

function ErrorFallback({ 
  error, 
  resetErrorBoundary, 
  title = "Something went wrong",
  showDetails = false,
  showBackButton = false,
  onBack
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>

        {(isDevelopment || showDetails) && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Error Details
            </summary>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </div>
          </details>
        )}

        <div className="flex gap-2 pt-4">
          {showBackButton && onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
          <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  showDetails?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

export function EnhancedErrorBoundary({
  children,
  title,
  showDetails,
  showBackButton,
  onBack,
  onError,
  onReset
}: EnhancedErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <ErrorFallback
          {...props}
          title={title}
          showDetails={showDetails}
          showBackButton={showBackButton}
          onBack={onBack}
        />
      )}
      onError={onError}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export { ErrorFallback };