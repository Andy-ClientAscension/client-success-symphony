import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorRecoveryProps {
  onRetry?: () => void;
  errorMessage?: string;
}

export function ErrorRecovery({ onRetry, errorMessage }: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } catch (error) {
        console.error('Retry failed:', error);
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <Alert className="border-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <p>{errorMessage || 'An error occurred while loading data.'}</p>
        {onRetry && (
          <Button 
            onClick={handleRetry}
            variant="outline"
            size="sm"
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}