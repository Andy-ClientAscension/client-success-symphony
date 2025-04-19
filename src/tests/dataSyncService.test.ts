
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  dataSyncService,
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
    dataSyncService.initializeDataSync();
    expect(vi.getTimerCount()).toBe(0); // No timer set during initialization
  });

  it('should start and stop auto sync', () => {
    dataSyncService.startAutoSync();
    expect(vi.getTimerCount()).toBe(1);
    
    dataSyncService.stopAutoSync();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should handle manual sync', async () => {
    const syncResult = await dataSyncService.manualSync();
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
      dataSyncService.saveData(testKey, newData);
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
      dataSyncService.saveData('largeData', largeDataset);
    });
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // Allow for a more generous processing time in tests
    expect(processingTime).toBeLessThan(1000); // Should process in under 1000ms in test environment
    expect(result.current[0].length).toBe(10000);
  });
});
