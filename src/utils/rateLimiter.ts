
/**
 * Simple rate limiter utility for frontend operations
 * Helps prevent brute force attacks and excessive API calls
 */

type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
};

type RateLimitState = {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
};

const RATE_LIMIT_STORAGE_KEY_PREFIX = 'rateLimit_';

/**
 * Get the stored rate limit state for a specific operation
 */
const getRateLimitState = (operation: string): RateLimitState | null => {
  const storageKey = `${RATE_LIMIT_STORAGE_KEY_PREFIX}${operation}`;
  const storedState = localStorage.getItem(storageKey);
  return storedState ? JSON.parse(storedState) : null;
};

/**
 * Store the rate limit state for a specific operation
 */
const setRateLimitState = (operation: string, state: RateLimitState): void => {
  const storageKey = `${RATE_LIMIT_STORAGE_KEY_PREFIX}${operation}`;
  localStorage.setItem(storageKey, JSON.stringify(state));
};

/**
 * Clear the rate limit state for a specific operation
 */
const clearRateLimitState = (operation: string): void => {
  const storageKey = `${RATE_LIMIT_STORAGE_KEY_PREFIX}${operation}`;
  localStorage.removeItem(storageKey);
};

/**
 * Check if an operation is rate limited
 * @returns Object with isLimited status and optional remainingTime in ms
 */
export const checkRateLimit = (
  operation: string, 
  config: RateLimitConfig
): { isLimited: boolean; remainingMs?: number; attemptsLeft?: number } => {
  const state = getRateLimitState(operation);
  const now = Date.now();
  
  // Check if currently blocked
  if (state?.blockedUntil && state.blockedUntil > now) {
    return { 
      isLimited: true, 
      remainingMs: state.blockedUntil - now 
    };
  }
  
  // Start fresh if no state or window has expired
  if (!state || !state.firstAttemptTime || (now - state.firstAttemptTime > config.windowMs)) {
    return { isLimited: false, attemptsLeft: config.maxAttempts };
  }
  
  // Check if max attempts reached within time window
  if (state.attempts >= config.maxAttempts) {
    // Within time window and max attempts reached
    const remainingWindowMs = state.firstAttemptTime + config.windowMs - now;
    
    if (remainingWindowMs <= 0) {
      // Window has passed, reset the counter
      clearRateLimitState(operation);
      return { isLimited: false, attemptsLeft: config.maxAttempts };
    }
    
    // If blocking duration is specified, apply a block
    if (config.blockDurationMs) {
      const blockedUntil = now + config.blockDurationMs;
      setRateLimitState(operation, {
        ...state,
        blockedUntil
      });
      
      return { 
        isLimited: true, 
        remainingMs: config.blockDurationMs 
      };
    }
    
    return { 
      isLimited: true, 
      remainingMs: remainingWindowMs 
    };
  }
  
  // Still has attempts left
  return { 
    isLimited: false, 
    attemptsLeft: config.maxAttempts - state.attempts 
  };
};

/**
 * Record an attempt for a specific operation
 */
export const recordRateLimitAttempt = (operation: string): void => {
  const state = getRateLimitState(operation);
  const now = Date.now();
  
  if (!state) {
    // First attempt
    setRateLimitState(operation, {
      attempts: 1,
      firstAttemptTime: now
    });
    return;
  }
  
  // Check if time window has expired and we should reset
  if (now - state.firstAttemptTime > (state.blockedUntil ? 0 : 60 * 1000)) {
    setRateLimitState(operation, {
      attempts: 1,
      firstAttemptTime: now
    });
    return;
  }
  
  // Increment attempts
  setRateLimitState(operation, {
    ...state,
    attempts: state.attempts + 1
  });
};

/**
 * Reset rate limit counter for a specific operation
 * Used after successful operations to remove penalties
 */
export const resetRateLimit = (operation: string): void => {
  clearRateLimitState(operation);
};

/**
 * Rate limit configurations for different operations
 */
export const rateLimitConfigs = {
  login: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes block
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour block
  },
  dataMutation: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  }
};
