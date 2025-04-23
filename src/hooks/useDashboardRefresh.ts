
import { useState, useCallback } from "react";

/**
 * Custom hook for refreshing dashboard data with accessibility and error handling.
 * @param analyzeClientsFn - function that triggers AI/dashboard analysis
 * @param announceToScreenReader - function to announce status to a screen reader
 */
export function useDashboardRefresh(
  analyzeClientsFn: (refresh?: boolean) => Promise<any>,
  announceToScreenReader: (message: string, mode: "polite" | "assertive") => void
) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    announceToScreenReader('Refreshing dashboard data', 'polite');
    
    return analyzeClientsFn(true)
      .then(() => {
        announceToScreenReader('Dashboard data refresh complete', 'polite');
        return true; // Signal success for chaining
      })
      .catch(error => {
        announceToScreenReader(`Refresh failed: ${error.message}`, 'assertive');
        console.error('Refresh error:', error);
        return false; // Signal failure for chaining
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [analyzeClientsFn, announceToScreenReader]);

  return { isRefreshing, handleRefreshData };
}
