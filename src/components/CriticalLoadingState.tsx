
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
  timeout = 8000, // Reduced default timeout from 15s to 8s
  fallbackAction
}: CriticalLoadingStateProps) {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  const timeoutThreshold = timeout;
  const intervalRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  
  // Set up timeout detection
  useEffect(() => {
    const startTime = Date.now();
    
    // Clear any existing intervals first to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
    
    // Set up new interval for tracking elapsed time
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (elapsed > timeoutThreshold) {
        setShowTimeout(true);
        clearInterval(intervalRef.current as number);
      }
    }, 500); // Check more frequently (500ms instead of 1000ms)
    
    // Set a delayed timeout to show the fallback button (after 1 extra second)
    fallbackTimeoutRef.current = window.setTimeout(() => {
      if (fallbackAction) {
        setShowFallbackButton(true);
      }
    }, timeoutThreshold + 1000); // Reduced from 2s to 1s
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, [timeoutThreshold, fallbackAction]);

  // Automatically trigger fallback after a very long wait if user hasn't clicked
  useEffect(() => {
    if (showTimeout && fallbackAction) {
      const autoFallbackTimer = setTimeout(() => {
        console.warn("Auto triggering fallback after extended wait");
        fallbackAction();
      }, 5000); // Reduced from 10s to 5s
      
      return () => clearTimeout(autoFallbackTimer);
    }
  }, [showTimeout, fallbackAction]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] p-8 ${
      isBlocking ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''
    }`} data-testid="critical-loading-state">
      <Spinner size="lg" className="mb-4" />
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        {showTimeout 
          ? "Taking longer than expected..." 
          : "Please wait while data is being loaded..."}
      </p>
      
      {showTimeout && showFallbackButton && fallbackAction && (
        <Button 
          onClick={fallbackAction}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Continue Anyway
        </Button>
      )}

      {showTimeout && !fallbackAction && (
        <div className="mt-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-800 rounded-md text-sm text-amber-800 dark:text-amber-200">
          This is taking longer than expected. You may try refreshing the page.
        </div>
      )}
      
      {/* Show elapsed time indicator after 2 seconds */}
      {elapsedTime > 2000 && !showTimeout && (
        <div className="mt-4 text-xs text-muted-foreground">
          {Math.floor(elapsedTime / 1000)}s elapsed
        </div>
      )}
    </div>
  );
}

export default CriticalLoadingState;
