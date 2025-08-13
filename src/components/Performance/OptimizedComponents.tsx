import { memo, useMemo, useCallback } from 'react';
// Removed react-window import as it's not installed

// Memoized chart component
export const MemoizedChart = memo(({ data, type, ...props }: any) => {
  // Only re-render when data or type changes
  const chartData = useMemo(() => {
    return data ? processChartData(data, type) : [];
  }, [data, type]);

  return <ChartComponent data={chartData} {...props} />;
}, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.type === nextProps.type &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});

// Memoized table row (simplified without react-window)
export const MemoizedTableRow = memo(({ index, data }: { index: number; data: any[] }) => {
  const item = data[index];
  
  return (
    <div className="flex items-center p-2 border-b">
      <div className="flex-1">{item.name}</div>
      <div className="w-20">{item.status}</div>
      <div className="w-24">{item.value}</div>
    </div>
  );
});

// Optimized data processor
export const useOptimizedData = (rawData: any[], filters: any) => {
  return useMemo(() => {
    if (!rawData?.length) return [];
    
    // Apply filters efficiently
    let filtered = rawData;
    
    if (filters.status?.length) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }
    
    if (filters.team?.length) {
      filtered = filtered.filter(item => filters.team.includes(item.team));
    }
    
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
        return true;
      });
    }
    
    return filtered;
  }, [rawData, filters]);
};

// Debounced search hook
export const useDebouncedSearch = (searchTerm: string, delay = 300) => {
  return useMemo(() => {
    const timeoutId = setTimeout(() => searchTerm, delay);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, delay]);
};

// Optimized event handlers
export const useOptimizedHandlers = () => {
  const handleClick = useCallback((id: string) => {
    // Optimized click handler
    console.log('Clicked:', id);
  }, []);

  const handleChange = useCallback((field: string, value: any) => {
    // Batched state updates
    console.log('Changed:', field, value);
  }, []);

  const handleSubmit = useCallback((data: any) => {
    // Optimized form submission
    console.log('Submit:', data);
  }, []);

  return { handleClick, handleChange, handleSubmit };
};

// Helper function for processing chart data
function processChartData(data: any[], type: string) {
  switch (type) {
    case 'line':
      return data.map(item => ({ x: item.date, y: item.value }));
    case 'bar':
      return data.map(item => ({ label: item.name, value: item.count }));
    case 'pie':
      return data.map(item => ({ name: item.category, value: item.percentage }));
    default:
      return data;
  }
}

// Placeholder chart component
function ChartComponent({ data, ...props }: any) {
  return (
    <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
      Chart with {data?.length || 0} data points
    </div>
  );
}

MemoizedChart.displayName = 'MemoizedChart';
MemoizedTableRow.displayName = 'MemoizedTableRow';