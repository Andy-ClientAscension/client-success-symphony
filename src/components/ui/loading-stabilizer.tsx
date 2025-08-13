import { useEffect, useState, useRef } from 'react';

interface LoadingStabilizerProps {
  isLoading: boolean;
  minLoadingTime?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Stabilizes loading states to prevent flashing UI
 */
export function LoadingStabilizer({ 
  isLoading, 
  minLoadingTime = 500,
  children, 
  fallback 
}: LoadingStabilizerProps) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      loadingStartTime.current = Date.now();
    } else if (loadingStartTime.current) {
      const elapsed = Date.now() - loadingStartTime.current;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      if (remaining > 0) {
        setTimeout(() => {
          setShowLoading(false);
          loadingStartTime.current = null;
        }, remaining);
      } else {
        setShowLoading(false);
        loadingStartTime.current = null;
      }
    } else {
      setShowLoading(false);
    }
  }, [isLoading, minLoadingTime]);

  if (showLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}