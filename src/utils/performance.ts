import React from 'react';

// Performance optimization utility for React components
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> => {
  return React.memo(Component, compare);
};

// Memoization helper for complex objects
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return React.useCallback(callback, deps);
};

// Stable reference hook for objects
export const useStableReference = <T>(value: T): T => {
  const ref = React.useRef<T>(value);
  
  // Only update if deeply different (simple comparison)
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
};

// Performance monitoring hook
export const useRenderCount = (componentName: string): void => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      // Track render count in development
    }
  });
};