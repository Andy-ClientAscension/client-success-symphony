import React from 'react';
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientsErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ClientsErrorFallback({ error, resetErrorBoundary }: ClientsErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Clients Module Error</CardTitle>
          <CardDescription>
            Something went wrong while loading the clients interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button onClick={resetErrorBoundary} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ClientsErrorBoundaryProps {
  children: React.ReactNode;
}

export function ClientsErrorBoundary({ children }: ClientsErrorBoundaryProps) {
  return (
    <EnhancedErrorBoundary
      fallback={ClientsErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Clients feature error:', error, errorInfo);
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}