/**
 * Data stabilization utilities to prevent re-render loops
 */
export class DataStabilizer {
  private static cache = new Map<string, { data: any; hash: string; timestamp: number }>();
  private static readonly CACHE_DURATION = 5000; // 5 seconds

  /**
   * Checks if data has actually changed to prevent unnecessary updates
   */
  static hasDataChanged<T>(key: string, newData: T): boolean {
    const cached = this.cache.get(key);
    const newHash = JSON.stringify(newData);
    
    if (!cached) {
      this.cache.set(key, { data: newData, hash: newHash, timestamp: Date.now() });
      return true;
    }
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.set(key, { data: newData, hash: newHash, timestamp: Date.now() });
      return true;
    }
    
    // Check if data actually changed
    if (cached.hash !== newHash) {
      this.cache.set(key, { data: newData, hash: newHash, timestamp: Date.now() });
      return true;
    }
    
    return false;
  }
  
  /**
   * Clears cache for a specific key
   */
  static clearCache(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clears all cache
   */
  static clearAllCache(): void {
    this.cache.clear();
  }
  
  /**
   * Debounce utility for event handlers
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }
  
  /**
   * Throttle utility for frequent events
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
}