
import React, { useState, useEffect } from 'react';

interface CriticalLoadingStateProps {
  message?: string;
  isBlocking?: boolean;
  timeout?: number;
  fallbackAction?: () => void;
}

/**
 * An enhanced loading state component with timeout handling
 * to prevent users from being stuck in loading states indefinitely.
 */
export function CriticalLoadingState({ 
  message = "Loading...", 
  isBlocking = true,
  timeout = 15000, // 15 seconds default timeout
  fallbackAction
}: CriticalLoadingStateProps) {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timeoutThreshold = timeout;
  
  // Set up timeout detection
  useEffect(() => {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (elapsed > timeoutThreshold) {
        setShowTimeout(true);
        clearInterval(intervalId);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeoutThreshold]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] p-8 ${
      isBlocking ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''
    }`} data-testid="critical-loading-state">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        {showTimeout 
          ? "Taking longer than expected..." 
          : "Please wait while data is being loaded..."}
      </p>
      
      {showTimeout && fallbackAction && (
        <button 
          onClick={fallbackAction}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Continue Anyway
        </button>
      )}

      {showTimeout && !fallbackAction && (
        <div className="mt-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-800 rounded-md text-sm text-amber-800 dark:text-amber-200">
          This is taking longer than expected. You may try refreshing the page.
        </div>
      )}
      
      {/* Show elapsed time indicator after 5 seconds */}
      {elapsedTime > 5000 && !showTimeout && (
        <div className="mt-4 text-xs text-muted-foreground">
          {Math.floor(elapsedTime / 1000)}s elapsed
        </div>
      )}
    </div>
  );
}

export default CriticalLoadingState;
