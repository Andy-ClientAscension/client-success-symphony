
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  initializeDataSync, 
  startAutoSync, 
  stopAutoSync, 
  manualSync,
  useRealtimeData 
} from '@/utils/dataSyncService';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Data Sync Service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('should initialize data sync service', () => {
    initializeDataSync();
    expect(vi.getTimerCount()).toBe(1); // Check if interval is set
  });

  it('should start and stop auto sync', () => {
    startAutoSync();
    expect(vi.getTimerCount()).toBe(1);
    
    stopAutoSync();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should handle manual sync', async () => {
    const syncResult = await manualSync();
    expect(syncResult).toBe(true);
  });

  it('should update subscribers when data changes', async () => {
    const testKey = 'testData';
    const initialData = ['item1'];
    const newData = ['item1', 'item2'];

    const { result } = renderHook(() => useRealtimeData(testKey, initialData));
    
    expect(result.current[0]).toEqual(initialData);
    
    // Simulate data update
    act(() => {
      localStorageMock.setItem(testKey, JSON.stringify(newData));
      window.dispatchEvent(new StorageEvent('storage', {
        key: testKey,
        newValue: JSON.stringify(newData)
      }));
    });
    
    expect(result.current[0]).toEqual(newData);
  });

  it('should handle large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }));

    const { result } = renderHook(() => useRealtimeData('largeData', []));
    
    const startTime = performance.now();
    
    act(() => {
      localStorageMock.setItem('largeData', JSON.stringify(largeDataset));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'largeData',
        newValue: JSON.stringify(largeDataset)
      }));
    });
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(100); // Should process in under 100ms
    expect(result.current[0].length).toBe(10000);
  });
});
