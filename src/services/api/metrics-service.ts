
import { apiCore, executeApiRequest, ApiResponse } from './api-core';
import { supabase } from "@/integrations/supabase/client";
import { errorService } from "@/utils/error";

export interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  trend?: number;
  target?: number;
  period?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  activeStudents: number;
  completedStudents: number;
  averageNps: number;
  averageProgress: number;
  retentionRate: number;
  churnRate: number;
  revenue: number;
}

/**
 * Get all metrics
 */
export async function getMetrics(): Promise<ApiResponse<MetricData[]>> {
  return executeApiRequest(async () => {
    // In a real app this would fetch from an actual metrics table
    // For now, simulate with client data aggregation
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) throw error;

    // Transform client data into metrics
    const metrics: MetricData[] = [
      {
        id: '1',
        name: 'Active Students',
        value: clients.filter(c => c.status === 'active').length,
        previousValue: 0,
        trend: 5,
        target: 100,
        category: 'students',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Average NPS',
        value: clients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / 
               (clients.filter(c => c.npsScore !== null && c.npsScore !== undefined).length || 1),
        previousValue: 7.5,
        trend: 0.5,
        target: 9,
        category: 'satisfaction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Completion Rate',
        value: (clients.filter(c => c.status === 'completed').length / (clients.length || 1)) * 100,
        previousValue: 65,
        trend: 5,
        target: 85,
        category: 'performance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return metrics;
  }, {
    errorMessage: "Failed to fetch metrics"
  });
}

/**
 * Get dashboard metrics summary
 */
export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  return executeApiRequest(async () => {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) throw error;

    const activeClients = clients.filter(c => c.status === 'active');
    const completedClients = clients.filter(c => c.status === 'completed');
    
    // Calculate metrics from client data
    const metrics: DashboardMetrics = {
      activeStudents: activeClients.length,
      completedStudents: completedClients.length,
      averageNps: clients.reduce((sum, c) => sum + (c.npsScore || 0), 0) / 
                 (clients.filter(c => c.npsScore !== null && c.npsScore !== undefined).length || 1),
      averageProgress: clients.reduce((sum, c) => sum + (c.progress || 0), 0) / (clients.length || 1),
      retentionRate: clients.length ? (activeClients.length / clients.length) * 100 : 0,
      churnRate: clients.length ? 
        ((clients.filter(c => c.status === 'inactive').length) / clients.length) * 100 : 0,
      revenue: clients.reduce((sum, c) => sum + (c.mrr || 0), 0)
    };

    return metrics;
  }, {
    errorMessage: "Failed to fetch dashboard metrics"
  });
}
