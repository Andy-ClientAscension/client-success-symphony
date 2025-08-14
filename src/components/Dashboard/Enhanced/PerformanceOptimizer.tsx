import React, { useMemo, memo, useCallback } from 'react';

// Simple debounce implementation to avoid external dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout;
  
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  
  debounced.cancel = () => clearTimeout(timeoutId);
  
  return debounced;
};

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: any }) => React.ReactNode;
  className?: string;
}

// Simple virtualization implementation without react-window
export const VirtualizedList = memo(({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}: VirtualizedListProps) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItemCount = Math.ceil(height / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div 
      className={className}
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: offsetY + (index * itemHeight),
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem({ 
                index: actualIndex, 
                style: { height: itemHeight }, 
                data: item 
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage = memo(({ src, alt, className, placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
      )}
      {!isLoaded && placeholder && (
        <div className="bg-muted animate-pulse rounded">
          {placeholder}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

interface DebouncedSearchProps {
  onSearch: (query: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

export const DebouncedSearch = memo(({ 
  onSearch, 
  delay = 300, 
  placeholder = "Search...",
  className 
}: DebouncedSearchProps) => {
  const [value, setValue] = React.useState('');

  const debouncedSearch = useMemo(
    () => debounce((query: string) => onSearch(query), delay),
    [onSearch, delay]
  );

  React.useEffect(() => {
    debouncedSearch(value);
    return () => debouncedSearch.cancel();
  }, [value, debouncedSearch]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={className}
      aria-label="Search input"
    />
  );
});

DebouncedSearch.displayName = 'DebouncedSearch';

interface MemoizedChartProps {
  data: any[];
  children: React.ReactNode;
}

export const MemoizedChart = memo(({ data, children }: MemoizedChartProps) => {
  // Only re-render if data reference changes
  const memoizedData = useMemo(() => data, [data]);
  
  // Create a stable key based on data length and first/last items
  const chartKey = useMemo(() => {
    if (!memoizedData.length) return 'empty';
    const first = memoizedData[0];
    const last = memoizedData[memoizedData.length - 1];
    return `${memoizedData.length}-${JSON.stringify(first)}-${JSON.stringify(last)}`;
  }, [memoizedData]);

  return (
    <div key={chartKey}>
      {children}
    </div>
  );
});

MemoizedChart.displayName = 'MemoizedChart';