
import { describe, it, expect } from 'vitest';
import { 
  calculateStatusCounts,
  calculateRates,
  getComprehensiveMetrics
} from '@/utils/analyticsUtils';

describe('Analytics Utils', () => {
  const mockClients = [
    { id: '1', status: 'active', mrr: 100, callsBooked: 5, dealsClosed: 2 },
    { id: '2', status: 'at-risk', mrr: 200, callsBooked: 3, dealsClosed: 1 },
    { id: '3', status: 'churned', mrr: 0, callsBooked: 0, dealsClosed: 0 },
    { id: '4', status: 'active', mrr: 150, callsBooked: 4, dealsClosed: 3 }
  ];

  it('should calculate status counts correctly', () => {
    const counts = calculateStatusCounts(mockClients);
    
    expect(counts.active).toBe(2);
    expect(counts.atRisk).toBe(1);
    expect(counts.churned).toBe(1);
    expect(counts.total).toBe(4);
  });

  it('should calculate rates correctly', () => {
    const counts = calculateStatusCounts(mockClients);
    const rates = calculateRates(counts);
    
    expect(rates.retentionRate).toBe(50); // 2 active out of 4
    expect(rates.atRiskRate).toBe(25); // 1 at-risk out of 4
    expect(rates.churnRate).toBe(25); // 1 churned out of 4
  });

  it('should handle empty client list', () => {
    const counts = calculateStatusCounts([]);
    const rates = calculateRates(counts);
    
    expect(counts.total).toBe(0);
    expect(rates.retentionRate).toBe(0);
    expect(rates.atRiskRate).toBe(0);
    expect(rates.churnRate).toBe(0);
  });

  it('should calculate comprehensive metrics correctly', () => {
    const metrics = getComprehensiveMetrics(mockClients);
    
    expect(metrics.totalMRR).toBe(450); // Sum of all MRR
    expect(metrics.totalCallsBooked).toBe(12);
    expect(metrics.totalDealsClosed).toBe(6);
    expect(metrics.clientCount).toBe(4);
  });

  it('should handle large datasets efficiently', () => {
    const largeClientList = Array.from({ length: 10000 }, (_, i) => ({
      id: `${i}`,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'at-risk' : 'churned',
      mrr: Math.random() * 1000,
      callsBooked: Math.floor(Math.random() * 10),
      dealsClosed: Math.floor(Math.random() * 5)
    }));

    const startTime = performance.now();
    const metrics = getComprehensiveMetrics(largeClientList);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should process in under 100ms
    expect(metrics.clientCount).toBe(10000);
  });
});
