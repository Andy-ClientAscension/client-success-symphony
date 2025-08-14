/**
 * Hook Testing Examples
 * Testing custom hooks and their behaviors
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the custom hooks we created earlier
function useAsyncOperation(options: any = {}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async (operation: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return { isLoading, error, execute };
}

function useDataFetch(fetcher: () => Promise<any>, options: any = {}) {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetch = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, options]);

  React.useEffect(() => {
    if (options.immediate !== false) {
      fetch();
    }
  }, [fetch, options.immediate]);

  return { data, isLoading, error, fetch };
}

// Test wrapper for hooks that need providers
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Custom Hooks', () => {
  describe('useAsyncOperation', () => {
    it('should handle async operations with loading states', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      const onSuccess = vi.fn();

      const { result } = renderHook(() => 
        useAsyncOperation({ onSuccess })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);

      // Execute async operation
      act(() => {
        result.current.execute(mockOperation);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOperation).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('success');
      expect(result.current.error).toBe(null);
    });

    it('should handle async operation errors', async () => {
      const mockError = new Error('Operation failed');
      const mockOperation = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();

      const { result } = renderHook(() => 
        useAsyncOperation({ onError })
      );

      act(() => {
        result.current.execute(mockOperation);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should handle multiple concurrent operations', async () => {
      const mockOperation1 = vi.fn().mockResolvedValue('result1');
      const mockOperation2 = vi.fn().mockResolvedValue('result2');

      const { result } = renderHook(() => useAsyncOperation());

      // Start first operation
      act(() => {
        result.current.execute(mockOperation1);
      });

      expect(result.current.isLoading).toBe(true);

      // Start second operation
      act(() => {
        result.current.execute(mockOperation2);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOperation1).toHaveBeenCalled();
      expect(mockOperation2).toHaveBeenCalled();
    });
  });

  describe('useDataFetch', () => {
    it('should fetch data on mount when immediate is true', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const mockFetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => 
        useDataFetch(mockFetcher, { immediate: true })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockFetcher).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('should not fetch data on mount when immediate is false', () => {
      const mockFetcher = vi.fn().mockResolvedValue({ test: 'data' });

      const { result } = renderHook(() => 
        useDataFetch(mockFetcher, { immediate: false })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      const mockFetcher = vi.fn().mockRejectedValue(mockError);
      const onError = vi.fn();

      const { result } = renderHook(() => 
        useDataFetch(mockFetcher, { onError })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBe(null);
      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should allow manual refetch', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const mockFetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => 
        useDataFetch(mockFetcher, { immediate: false })
      );

      expect(mockFetcher).not.toHaveBeenCalled();

      // Manual fetch
      act(() => {
        result.current.fetch();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should update when fetcher changes', async () => {
      const mockData1 = { id: 1, name: 'Data 1' };
      const mockData2 = { id: 2, name: 'Data 2' };
      
      const mockFetcher1 = vi.fn().mockResolvedValue(mockData1);
      const mockFetcher2 = vi.fn().mockResolvedValue(mockData2);

      const { result, rerender } = renderHook(
        ({ fetcher }) => useDataFetch(fetcher),
        { initialProps: { fetcher: mockFetcher1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData1);

      // Change fetcher
      rerender({ fetcher: mockFetcher2 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData2);
      expect(mockFetcher2).toHaveBeenCalled();
    });
  });

  describe('Combined Hook Usage', () => {
    it('should work together for complex operations', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ users: ['user1', 'user2'] });
      
      function useComplexOperation() {
        const asyncOp = useAsyncOperation();
        const dataFetch = useDataFetch(mockApiCall, { immediate: false });

        const performComplexOperation = React.useCallback(async () => {
          return asyncOp.execute(async () => {
            const result = await dataFetch.fetch();
            return result;
          });
        }, [asyncOp, dataFetch]);

        return {
          ...asyncOp,
          data: dataFetch.data,
          performComplexOperation
        };
      }

      const { result } = renderHook(() => useComplexOperation());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(null);

      act(() => {
        result.current.performComplexOperation();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({ users: ['user1', 'user2'] });
      expect(mockApiCall).toHaveBeenCalled();
    });
  });
});