
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
 * An enhanced loading state component with improved timeout handling
 * to prevent users from being stuck in loading states indefinitely.
 */
export function CriticalLoadingState({ 
  message = "Loading...", 
  isBlocking = true,
  timeout = 8000,
  fallbackAction
}: CriticalLoadingStateProps) {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  const [autoFallbackTriggered, setAutoFallbackTriggered] = useState(false);
  const timeoutThreshold = timeout;
  const intervalRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const autoFallbackRef = useRef<number | null>(null);
  const mountTimeRef = useRef(Date.now());
  const isUnmountedRef = useRef(false);
  
  // Set up timeout detection with safer implementation
  useEffect(() => {
    // Store start time and reset flags
    mountTimeRef.current = Date.now();
    isUnmountedRef.current = false;
    
    // Clear any existing intervals first to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (autoFallbackRef.current) {
      clearTimeout(autoFallbackRef.current);
      autoFallbackRef.current = null;
    }
    
    // Set up new interval for tracking elapsed time
    intervalRef.current = window.setInterval(() => {
      if (isUnmountedRef.current) return;
      
      const elapsed = Date.now() - mountTimeRef.current;
      setElapsedTime(elapsed);
      
      if (elapsed > timeoutThreshold) {
        setShowTimeout(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 250); // Check more frequently
    
    // Set a delayed timeout to show the fallback button
    if (fallbackAction) {
      fallbackTimeoutRef.current = window.setTimeout(() => {
        if (!isUnmountedRef.current) {
          console.log("[CriticalLoadingState] Showing fallback button");
          setShowFallbackButton(true);
        }
      }, Math.min(timeoutThreshold, 2000)); // Show button more quickly
      
      // Set more aggressive auto-fallback
      autoFallbackRef.current = window.setTimeout(() => {
        if (!isUnmountedRef.current && !autoFallbackTriggered) {
          console.warn("[CriticalLoadingState] Auto triggering fallback after timeout");
          setAutoFallbackTriggered(true);
          
          if (fallbackAction) {
            try {
              fallbackAction();
            } catch (error) {
              console.error("[CriticalLoadingState] Error in fallback action:", error);
            }
          }
        }
      }, Math.min(timeoutThreshold * 1.2, 3000)); // More aggressive auto-fallback
    }
    
    // Cleanup function
    return () => {
      isUnmountedRef.current = true;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if (autoFallbackRef.current) {
        clearTimeout(autoFallbackRef.current);
        autoFallbackRef.current = null;
      }
    };
  }, [timeoutThreshold, fallbackAction, autoFallbackTriggered]);

  // Handle fallback action with error boundary
  const handleFallback = () => {
    if (fallbackAction) {
      try {
        fallbackAction();
      } catch (error) {
        console.error("[CriticalLoadingState] Error in fallback action:", error);
      }
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-[300px] p-8 ${
        isBlocking ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''
      }`} 
      data-testid="critical-loading-state"
    >
      <Spinner size="lg" className="mb-4" />
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        {showTimeout 
          ? "Taking longer than expected..." 
          : "Please wait while data is being loaded..."}
      </p>
      
      {showTimeout && showFallbackButton && fallbackAction && (
        <Button 
          onClick={handleFallback}
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
      
      {/* Show elapsed time indicator after 1 second */}
      {elapsedTime > 1000 && !showTimeout && (
        <div className="mt-4 text-xs text-muted-foreground">
          {Math.floor(elapsedTime / 1000)}s elapsed
        </div>
      )}
    </div>
  );
}

export default CriticalLoadingState;
