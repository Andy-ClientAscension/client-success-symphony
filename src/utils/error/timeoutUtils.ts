
/**
 * Creates a promise that rejects after the specified timeout
 * 
 * @param ms - Timeout in milliseconds
 * @param message - Optional error message
 * @returns Promise that rejects after the timeout
 */
export function createTimeoutPromise(ms: number, message = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Runs a promise with timeout and grace period
 * 
 * @param promise - The promise to run
 * @param options - Configuration options
 * @returns Promise result or throws error
 */
export async function withStaggeredTimeout<T>(
  promise: Promise<T>, 
  options: {
    initialTimeoutMs: number;
    gracePeriodMs: number;
    onInitialTimeout?: () => void;
    onGracePeriodStart?: () => void;
  }
): Promise<T> {
  const { initialTimeoutMs, gracePeriodMs, onInitialTimeout, onGracePeriodStart } = options;
  
  let isTimedOut = false;
  let initialTimeoutId: NodeJS.Timeout | null = null;
  let graceTimeoutId: NodeJS.Timeout | null = null;
  
  // Create a promise that completes when either:
  // 1. The original promise resolves/rejects
  // 2. Both the initial timeout and grace period expire
  const result = await new Promise<T>((resolve, reject) => {
    // Set initial timeout
    initialTimeoutId = setTimeout(() => {
      isTimedOut = true;
      if (onInitialTimeout) onInitialTimeout();
      
      // Start grace period
      graceTimeoutId = setTimeout(() => {
        if (onGracePeriodStart) onGracePeriodStart();
        reject(new Error('Operation timed out after grace period'));
      }, gracePeriodMs);
    }, initialTimeoutMs);
    
    // Handle the original promise
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => {
        // Clean up timeouts
        if (initialTimeoutId) clearTimeout(initialTimeoutId);
        if (graceTimeoutId) clearTimeout(graceTimeoutId);
      });
  });
  
  return result;
}

/**
 * A simplified version that uses Promise.race with a timeout
 * 
 * @param promise - The promise to run with timeout
 * @param ms - Timeout in milliseconds
 * @param message - Optional timeout error message
 * @returns Promise result or throws timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  message = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = createTimeoutPromise(ms, message);
  return Promise.race([promise, timeoutPromise]);
}
