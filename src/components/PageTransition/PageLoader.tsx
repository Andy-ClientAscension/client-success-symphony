
import { useEffect } from 'react';
import { LoadingState } from '@/components/LoadingState';
import { announceToScreenReader } from '@/lib/accessibility';

interface PageLoaderProps {
  message?: string;
  ariaLabel?: string;
}

export function PageLoader({ 
  message = "Please wait while we redirect you...", 
  ariaLabel = "Loading page"
}: PageLoaderProps) {
  // Announce loading state to screen readers
  useEffect(() => {
    announceToScreenReader(message, "polite");
  }, [message]);
  
  return (
    <div 
      id="page-loading" 
      tabIndex={-1} 
      className="flex items-center justify-center h-screen"
      aria-label={ariaLabel}
    >
      <LoadingState message={message} />
    </div>
  );
}
