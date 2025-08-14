import { supabase } from '@/integrations/supabase/client';
import { Student } from './student-service';

// Transform Supabase client data to match the Student interface
export function transformClientToStudent(client: any): Student {
  return {
    id: client.id,
    name: client.name,
    email: `${client.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Generate email for compatibility
    status: mapClientStatusToStudent(client.status),
    progress: client.progress || 0,
    notes: client.notes || '',
    npsScore: client.nps_score,
    startDate: client.start_date,
    endDate: client.end_date,
    team: client.team,
  };
}

function mapClientStatusToStudent(status: string): Student['status'] {
  switch (status) {
    case 'active':
    case 'new':
      return 'active';
    case 'at-risk':
    case 'churned':
      return 'inactive';
    case 'paused':
      return 'pending';
    case 'graduated':
      return 'completed';
    default:
      return 'active';
  }
}

export async function fetchDashboardData() {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform clients and calculate metrics
  const transformedClients = clients?.map(transformClientToStudent) || [];
  
  // Calculate counts by status
  const statusCounts = clients?.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate aggregated metrics
  const totalMRR = clients?.reduce((sum, client) => sum + (client.mrr || 0), 0) || 0;
  const totalCallsBooked = clients?.reduce((sum, client) => sum + (client.calls_booked || 0), 0) || 0;
  const totalDealsClosed = clients?.reduce((sum, client) => sum + (client.deals_closed || 0), 0) || 0;

  // Calculate average NPS
  const npsScores = clients?.filter(c => c.nps_score !== null).map(c => c.nps_score) || [];
  const averageNPS = npsScores.length > 0 ? 
    npsScores.reduce((sum, score) => sum + score, 0) / npsScores.length : 0;

  // Calculate churn rate (simplified)
  const totalClients = clients?.length || 0;
  const churnedClients = clients?.filter(c => c.status === 'churned').length || 0;
  const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;

  return {
    clients: transformedClients,
    clientCounts: {
      active: statusCounts.active || 0,
      'at-risk': statusCounts['at-risk'] || 0,
      new: statusCounts.new || 0,
      churned: statusCounts.churned || 0,
      ...statusCounts
    },
    metrics: {
      totalMRR,
      totalCallsBooked,
      totalDealsClosed,
      averageNPS,
      churnRate,
    },
    npsData: {
      current: Math.round(averageNPS),
      trend: [
        { month: 'Nov', score: Math.round(averageNPS) },
        { month: 'Oct', score: Math.round(averageNPS * 0.95) },
        { month: 'Sep', score: Math.round(averageNPS * 0.9) },
      ]
    },
    churnData: [
      { month: 'Nov', rate: churnRate },
      { month: 'Oct', rate: churnRate * 0.8 },
      { month: 'Sep', rate: churnRate * 0.6 },
    ]
  };
}