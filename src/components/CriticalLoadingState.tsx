
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
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium text-foreground">{message}</p>
    </div>
  );
}

export default CriticalLoadingState;
