
import { useState, useCallback } from "react";

/**
 * Custom hook for refreshing dashboard data with accessibility and error handling.
 * 
 * @param refreshFunction - function that triggers data refresh and returns a Promise
 * @param announceToScreenReader - function to announce status to a screen reader
 * @returns Object containing isRefreshing state and handleRefreshData function
 */
export function useDashboardRefresh(
  refreshFunction: (refresh?: boolean) => Promise<any>,
  announceToScreenReader: (message: string, mode: "polite" | "assertive") => void
) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    announceToScreenReader('Refreshing dashboard data', 'polite');
    
    return refreshFunction(true)
      .then((result) => {
        announceToScreenReader('Dashboard data refresh complete', 'polite');
        return result || true; // Ensure we return a value for chaining
      })
      .catch(error => {
        announceToScreenReader(`Refresh failed: ${error.message}`, 'assertive');
        console.error('Refresh error:', error);
        return false; // Signal failure for chaining
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refreshFunction, announceToScreenReader]);

  return { 
    isRefreshing, 
    handleRefreshData 
  };
}
