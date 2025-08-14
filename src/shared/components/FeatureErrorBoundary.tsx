import React from 'react';
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface FeatureErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  featureName: string;
  description?: string;
  onGoBack?: () => void;
}

function FeatureErrorFallback({ 
  error, 
  resetErrorBoundary, 
  featureName,
  description = "Something went wrong in this feature",
  onGoBack
}: FeatureErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>{featureName} Error</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={resetErrorBoundary} variant="default" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  onGoBack?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function FeatureErrorBoundary({ 
  children, 
  featureName, 
  description,
  onGoBack,
  onError
}: FeatureErrorBoundaryProps) {
  return (
    <EnhancedErrorBoundary
      fallback={(props) => (
        <FeatureErrorFallback 
          {...props} 
          featureName={featureName}
          description={description}
          onGoBack={onGoBack}
        />
      )}
      onError={onError}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}