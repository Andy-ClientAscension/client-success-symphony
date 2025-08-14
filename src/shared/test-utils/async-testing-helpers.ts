import { waitFor, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Wait for async operations with timeout
export const waitForAsync = (
  assertion: () => void | Promise<void>,
  timeout = 5000
) => {
  return waitFor(assertion, { timeout });
};

// Wait for element to appear
export const waitForElement = (
  testId: string,
  timeout = 5000
) => {
  return waitFor(
    () => expect(screen.getByTestId(testId)).toBeInTheDocument(),
    { timeout }
  );
};

// Wait for element to disappear
export const waitForElementToDisappear = (
  testId: string,
  timeout = 5000
) => {
  return waitFor(
    () => expect(screen.queryByTestId(testId)).not.toBeInTheDocument(),
    { timeout }
  );
};

// Mock async function with delay
export const createMockAsyncFunction = <T>(
  returnValue: T,
  delay = 100,
  shouldReject = false
) => {
  return vi.fn().mockImplementation(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldReject) {
          reject(new Error('Mock async error'));
        } else {
          resolve(returnValue);
        }
      }, delay);
    })
  );
};

// Batch async operations
export const batchAsync = async (operations: (() => Promise<any>)[]) => {
  return Promise.all(operations.map(op => op()));
};

// Retry async operation
export const retryAsync = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// Mock loading states
export const mockLoadingStates = {
  // Simulate loading -> success flow
  loadingToSuccess: <T>(data: T, delay = 100) => {
    let state = { isLoading: true, data: null, error: null };
    
    setTimeout(() => {
      state = { isLoading: false, data, error: null };
    }, delay);
    
    return () => state;
  },

  // Simulate loading -> error flow
  loadingToError: (error: Error, delay = 100) => {
    let state = { isLoading: true, data: null, error: null };
    
    setTimeout(() => {
      state = { isLoading: false, data: null, error };
    }, delay);
    
    return () => state;
  }
};

// Test race conditions
export const testRaceCondition = async (
  fastOperation: () => Promise<any>,
  slowOperation: () => Promise<any>
) => {
  const results = await Promise.allSettled([
    fastOperation(),
    slowOperation()
  ]);
  
  return {
    fastResult: results[0],
    slowResult: results[1],
    fastWon: results[0].status === 'fulfilled' && results[1].status === 'rejected'
  };
};

// Mock network delays
export const mockNetworkDelay = (min = 100, max = 500) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Async test wrapper
export const asyncTest = (testFn: () => Promise<void>) => {
  return async () => {
    try {
      await testFn();
    } catch (error) {
      console.error('Async test failed:', error);
      throw error;
    }
  };
};

// Mock fetch with different scenarios
export const mockFetch = {
  success: <T>(data: T, delay = 100) => 
    vi.fn().mockImplementation(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(data)
          });
        }, delay);
      })
    ),

  error: (status = 500, message = 'Server Error', delay = 100) =>
    vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${status}: ${message}`));
        }, delay);
      })
    ),

  timeout: (timeoutDelay = 5000) =>
    vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeoutDelay);
      })
    )
};