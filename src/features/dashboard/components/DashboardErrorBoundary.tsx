import React from 'react';
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

interface DashboardErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function DashboardErrorFallback({ error, resetErrorBoundary }: DashboardErrorFallbackProps) {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Dashboard Error</CardTitle>
          <CardDescription>
            Unable to load dashboard components. Your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>This might be due to:</p>
            <ul className="mt-2 space-y-1">
              <li>• Temporary connectivity issues</li>
              <li>• Data loading problems</li>
              <li>• Component rendering errors</li>
            </ul>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button onClick={resetErrorBoundary} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Dashboard
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Full Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

export function DashboardErrorBoundary({ children }: DashboardErrorBoundaryProps) {
  return (
    <EnhancedErrorBoundary
      fallback={DashboardErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Dashboard feature error:', error, errorInfo);
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}