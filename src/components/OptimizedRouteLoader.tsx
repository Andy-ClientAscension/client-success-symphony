import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingState } from './LoadingState';

interface OptimizedRouteLoaderProps {
  children: React.ReactNode;
  /** Minimum time to show loading state (prevents flash) */
  minLoadingTime?: number;
  /** Maximum time to wait for data before showing content */
  maxWaitTime?: number;
}

/**
 * Route-level loader that prioritizes navigation speed over data completeness
 * Shows content immediately and loads data progressively
 */
export function OptimizedRouteLoader({ 
  children, 
  minLoadingTime = 100,
  maxWaitTime = 500 
}: OptimizedRouteLoaderProps) {
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const [isNavigationComplete, setIsNavigationComplete] = useState(false);

  useEffect(() => {
    // Reset state on route change
    setShowContent(false);
    setIsNavigationComplete(false);

    // Start timer for minimum loading time
    const minTimer = setTimeout(() => {
      setShowContent(true);
    }, minLoadingTime);

    // Start timer for maximum wait time
    const maxTimer = setTimeout(() => {
      setShowContent(true);
      setIsNavigationComplete(true);
    }, maxWaitTime);

    // Listen for navigation completion
    const handleNavigationComplete = () => {
      setIsNavigationComplete(true);
      // Show content immediately once navigation is complete
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      setShowContent(true);
    };

    window.addEventListener('navigation:completed', handleNavigationComplete);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('navigation:completed', handleNavigationComplete);
    };
  }, [location.pathname, minLoadingTime, maxWaitTime]);

  // Show loading state only briefly during route transitions
  if (!showContent) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}