
/**
 * Utility to manage AbortController instances
 * Helps prevent memory leaks by providing a consistent way to manage abort controllers
 */

/**
 * Creates a new AbortController and returns both the controller and signal
 * @returns {Object} Object containing controller and signal
 */
export function createAbortController() {
  const controller = new AbortController();
  const signal = controller.signal;
  return { controller, signal };
}

/**
 * Safely aborts a controller if it exists and is not already aborted
 * @param {AbortController | null} controller The controller to abort
 * @param {string} reason Optional reason for aborting
 * @returns {boolean} True if controller was aborted, false if it didn't exist or was already aborted
 */
export function safeAbort(controller: AbortController | null, reason: string = 'Operation cancelled'): boolean {
  if (controller && !controller.signal.aborted) {
    controller.abort(reason);
    return true;
  }
  return false;
}

/**
 * Creates an abort signal with a timeout
 * @param {number} timeoutMs Timeout in milliseconds
 * @returns {Object} Object with signal, clear method, and controller
 */
export function createTimeoutSignal(timeoutMs: number = 10000) {
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Using NodeJS.Timeout type for browser and Node.js compatibility
  const timeoutId: NodeJS.Timeout = setTimeout(() => {
    if (!signal.aborted) {
      controller.abort('Timeout');
    }
  }, timeoutMs);
  
  const clear = () => {
    clearTimeout(timeoutId);
  };
  
  return { signal, clear, controller };
}

/**
 * Checks if a signal is aborted
 * Safely handles null signals
 * @param {AbortSignal | null | undefined} signal The signal to check
 * @returns {boolean} True if signal exists and is aborted
 */
export function isAborted(signal: AbortSignal | null | undefined): boolean {
  return Boolean(signal && signal.aborted);
}
