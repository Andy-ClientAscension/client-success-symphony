import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    
    if (renderCount.current === 1) {
      console.log(`${componentName} initial render: ${endTime - startTime.current}ms`);
    }
  });

  const logRerender = useCallback(() => {
    console.log(`${componentName} re-rendered (count: ${renderCount.current})`);
  }, [componentName]);

  return { renderCount: renderCount.current, logRerender };
}

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance optimization
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Memoized calculation hook
export function useMemoizedCalculation<T>(
  calculateFn: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculateFn, dependencies);
}

// Optimized event handlers
export function useOptimizedHandlers() {
  const handleClick = useCallback((id: string) => {
    console.log('Optimized click:', id);
  }, []);

  const handleChange = useCallback((field: string, value: any) => {
    console.log('Optimized change:', field, value);
  }, []);

  const handleSubmit = useCallback((data: any) => {
    console.log('Optimized submit:', data);
  }, []);

  return { handleClick, handleChange, handleSubmit };
}

// Virtual scrolling simulation for large lists
export function useVirtualScrolling(
  items: any[], 
  containerHeight: number, 
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerProps: {
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll
    }
  };
}

// useState is imported from React at the top of the file