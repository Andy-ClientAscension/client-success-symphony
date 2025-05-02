
/**
 * Session caching utility for Supabase authentication
 * Provides methods to store, retrieve, and validate cached sessions
 */

const CACHE_KEY = 'supabase_session_cache';
const EXPIRY_KEY = 'supabase_session_expiry';

// TTL in milliseconds (default: 5 minutes)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Store session data in cache with expiration
 */
export const cacheSession = (session: any, ttl: number = DEFAULT_CACHE_TTL): void => {
  if (!session) return;
  
  try {
    // Store the session data
    localStorage.setItem(CACHE_KEY, JSON.stringify(session));
    
    // Store the expiration timestamp
    const expiryTime = Date.now() + ttl;
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    
    console.log(`Session cached, expires in ${ttl/1000}s`);
  } catch (error) {
    console.error("Failed to cache session:", error);
  }
};

/**
 * Get session from cache if valid
 * @returns The cached session or null if expired/not found
 */
export const getCachedSession = (): any | null => {
  try {
    // Check if cache has expired
    const expiryTime = localStorage.getItem(EXPIRY_KEY);
    
    if (!expiryTime || parseInt(expiryTime) < Date.now()) {
      clearCachedSession();
      return null;
    }
    
    // Get the cached session
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error retrieving cached session:", error);
    clearCachedSession();
    return null;
  }
};

/**
 * Clear the cached session data
 */
export const clearCachedSession = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};

/**
 * Update the TTL for an existing cached session
 */
export const refreshCachedSessionTTL = (ttl: number = DEFAULT_CACHE_TTL): void => {
  const expiryTime = Date.now() + ttl;
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
};

/**
 * Get the remaining TTL of the cached session in milliseconds
 * @returns Remaining TTL in milliseconds or 0 if expired/not found
 */
export const getCacheTimeRemaining = (): number => {
  try {
    const expiryTime = localStorage.getItem(EXPIRY_KEY);
    if (!expiryTime) return 0;
    
    const remaining = parseInt(expiryTime) - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
};
