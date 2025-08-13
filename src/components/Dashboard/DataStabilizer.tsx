import { useEffect, useRef } from 'react';
import { DataStabilizer } from '@/utils/dataStabilizer';

interface DataStabilizerProps {
  children: React.ReactNode;
  onStabilize?: () => void;
}

/**
 * Component wrapper that helps stabilize data updates and prevent render loops
 */
export function DataStabilizerWrapper({ children, onStabilize }: DataStabilizerProps) {
  const stabilizationTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any cache that might be causing issues
    DataStabilizer.clearAllCache();
    
    // Set up stabilization
    if (stabilizationTimer.current) {
      clearTimeout(stabilizationTimer.current);
    }
    
    stabilizationTimer.current = setTimeout(() => {
      onStabilize?.();
    }, 100);
    
    return () => {
      if (stabilizationTimer.current) {
        clearTimeout(stabilizationTimer.current);
      }
    };
  }, [onStabilize]);

  return <>{children}</>;
}