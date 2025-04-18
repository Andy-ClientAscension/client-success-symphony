
import { describe, it, expect } from 'vitest';
import { 
  calculateStatusCounts,
  calculateRates,
  getComprehensiveMetrics
} from '@/utils/analyticsUtils';
import { Client } from '@/lib/data';

describe('Analytics Utils', () => {
  // Create mock clients that satisfy the Client interface
  const mockClients: Client[] = [
    { 
      id: '1', 
      name: 'Client 1',
      status: 'active', 
      mrr: 100, 
      callsBooked: 5, 
      dealsClosed: 2,
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      contractValue: 1000,
      team: 'Team A'
    },
    { 
      id: '2', 
      name: 'Client 2',
      status: 'at-risk', 
      mrr: 200, 
      callsBooked: 3, 
      dealsClosed: 1,
      startDate: '2023-02-15',
      endDate: '2024-02-15',
      contractValue: 2000,
      team: 'Team B'
    },
    { 
      id: '3', 
      name: 'Client 3',
      status: 'churned', 
      mrr: 0, 
      callsBooked: 0, 
      dealsClosed: 0,
      startDate: '2022-08-01',
      endDate: '2023-08-01',
      contractValue: 0,
      team: 'Team A'
    },
    { 
      id: '4', 
      name: 'Client 4',
      status: 'active', 
      mrr: 150, 
      callsBooked: 4, 
      dealsClosed: 3,
      startDate: '2023-03-15',
      endDate: '2024-03-15',
      contractValue: 1500,
      team: 'Team C'
    }
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
    const largeClientList: Client[] = Array.from({ length: 10000 }, (_, i) => ({
      id: `${i}`,
      name: `Client ${i}`,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'at-risk' : 'churned',
      mrr: Math.random() * 1000,
      callsBooked: Math.floor(Math.random() * 10),
      dealsClosed: Math.floor(Math.random() * 5),
      startDate: `2023-01-${(i % 28) + 1}`.padEnd(10, '0').substring(0, 10),
      endDate: `2024-01-${(i % 28) + 1}`.padEnd(10, '0').substring(0, 10),
      contractValue: Math.random() * 10000,
      team: `Team ${Math.floor(i / 1000)}`
    }));

    const startTime = performance.now();
    const metrics = getComprehensiveMetrics(largeClientList);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should process in under 100ms
    expect(metrics.clientCount).toBe(10000);
  });
});
