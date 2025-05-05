
import React from 'react';

interface CriticalLoadingStateProps {
  message?: string;
}

/**
 * A loading state component that uses the critical CSS defined in the Layout component.
 * This helps prevent layout shifts during initial loading.
 */
export function CriticalLoadingState({ message = "Loading..." }: CriticalLoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="flex flex-col items-center justify-center">
        <div className="loading-spinner mb-4" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}

export default CriticalLoadingState;
