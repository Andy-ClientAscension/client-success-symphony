
import React from 'react';

interface CriticalLoadingStateProps {
  message?: string;
  isBlocking?: boolean;
}

/**
 * A loading state component that uses the critical CSS defined in the Layout component.
 * This helps prevent layout shifts during initial loading.
 */
export function CriticalLoadingState({ 
  message = "Loading...", 
  isBlocking = true 
}: CriticalLoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] p-8 ${
      isBlocking ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''
    }`} data-testid="critical-loading-state">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait while data is being loaded...</p>
    </div>
  );
}

export default CriticalLoadingState;
