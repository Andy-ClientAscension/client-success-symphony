import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCardEnhanced } from '@/components/ui/metric-card-enhanced';
import { UnifiedFilter } from '../Shared/UnifiedFilter';
import { useDashboardData } from '@/hooks/useDashboardData';
import { TrendingUp, TrendingDown, Star, MessageSquare, Users, DollarSign } from 'lucide-react';

export function SSCAnalytics() {
  const [selectedSSC, setSelectedSSC] = useState('all');
  const { allClients, teamMetrics } = useDashboardData();

  // Specific SSC names
  const sscs = ['Andy', 'Chris', 'Nick', 'Stephen', 'Cillin'];
  
  // Filter clients based on selected SSC
  const filteredClients = selectedSSC === 'all' 
    ? allClients 
    : allClients.filter(client => client.csm === selectedSSC);

  // Calculate SSC-specific metrics from client data
  const calculateSSCMetrics = () => {
    const totalClients = filteredClients.length;
    const activeClients = filteredClients.filter(client => client.status === 'active').length;
    const backendStudents = filteredClients.reduce((sum, client) => sum + (client.backendStudents || 0), 0);
    
    // Backend percentage (retention in program)
    const backendPercentage = totalClients > 0 ? (backendStudents / totalClients) * 100 : 0;
    
    // Average metrics
    const avgHealthScore = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.health_score || 0), 0) / filteredClients.length 
      : 0;
    
    const avgNPS = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / filteredClients.length 
      : 0;
    
    // LTV calculation (average contract value * average duration)
    const avgContractValue = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.contractValue || 0), 0) / filteredClients.length 
      : 0;
    
    const avgDuration = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.contract_duration_months || 12), 0) / filteredClients.length 
      : 12;
    
    const ltv = (avgContractValue / (avgDuration || 12)) * (avgDuration || 12);
    
    // Churn rate
    const churnedClients = filteredClients.filter(client => client.status === 'churned').length;
    const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;
    
    // Reviews and case studies
    const reviewsCollected = filteredClients.filter(client => client.trustPilotReview?.rating).length;
    const caseStudiesCompleted = filteredClients.filter(client => client.caseStudyInterview?.completed).length;
    const referralsCollected = filteredClients.reduce((sum, client) => sum + (client.referrals?.count || 0), 0);
    
    // Olympia Upsells (using growth as proxy)
    const olympiaUpsells = filteredClients.filter(client => (client.growth || 0) > 0).length;
    
    return {
      backendPercentage: Math.round(backendPercentage),
      olympiaUpsells,
      ltv,
      avgHealthScore: Math.round(avgHealthScore),
      avgNPS: Math.round(avgNPS),
      teamMRR: teamMetrics.totalMRR || 0,
      churnRate: Math.round(churnRate),
      reviewsCollected,
      caseStudiesCompleted,
      referralsCollected,
    };
  };

  const metrics = calculateSSCMetrics();

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          SSC Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <UnifiedFilter
            selectedTeam={selectedSSC}
            teams={['all', ...sscs]}
            onTeamChange={setSelectedSSC}
            showTeamFilter={true}
            showDateFilter={false}
            showSearch={false}
            showSort={false}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCardEnhanced
            title="Backend Retention"
            value={`${metrics.backendPercentage}%`}
            status={metrics.backendPercentage >= 80 ? "positive" : metrics.backendPercentage >= 60 ? "neutral" : "negative"}
            trend={{
              value: 5,
              direction: 'up',
              label: 'vs last month'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Olympia Upsells"
            value={metrics.olympiaUpsells}
            status="positive"
            trend={{
              value: 2,
              direction: 'up',
              label: 'this month'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Average LTV"
            value={`$${(metrics.ltv / 1000).toFixed(1)}k`}
            status="positive"
            trend={{
              value: 8,
              direction: 'up',
              label: 'vs last quarter'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Avg Health Score"
            value={`${metrics.avgHealthScore}/100`}
            status={metrics.avgHealthScore >= 80 ? "positive" : metrics.avgHealthScore >= 60 ? "neutral" : "negative"}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Average NPS"
            value={metrics.avgNPS}
            status={metrics.avgNPS >= 50 ? "positive" : metrics.avgNPS >= 30 ? "neutral" : "negative"}
            className="border-0 shadow-sm"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
          <MetricCardEnhanced
            title="Team MRR"
            value={`$${(metrics.teamMRR / 1000).toFixed(1)}k`}
            status="positive"
            trend={{
              value: 12,
              direction: 'up',
              label: 'vs last month'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Churn Rate"
            value={`${metrics.churnRate}%`}
            status={metrics.churnRate <= 5 ? "positive" : metrics.churnRate <= 15 ? "neutral" : "negative"}
            trend={{
              value: 3,
              direction: 'down',
              label: 'improvement'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Reviews Collected"
            value={metrics.reviewsCollected}
            status="positive"
            trend={{
              value: 4,
              direction: 'up',
              label: 'this month'
            }}
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Case Studies"
            value={metrics.caseStudiesCompleted}
            status="positive"
            className="border-0 shadow-sm"
          />
          
          <MetricCardEnhanced
            title="Referrals"
            value={metrics.referralsCollected}
            status="positive"
            trend={{
              value: 6,
              direction: 'up',
              label: 'this quarter'
            }}
            className="border-0 shadow-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}