
import { 
  Users, 
  AlertTriangle, 
  Phone,
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowDown,
  ArrowUp,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getClientMetricsByTeam } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Define a proper type for NPS data to match what's returned from getAverageNPS()
interface NPSData {
  current: number;
  previous: number;
  change: number;
  trend: string;
}

export function MetricsCards() {
  const [metricsData, setMetricsData] = useState({
    clientCounts: {
      active: 0,
      "at-risk": 0,
      new: 0,
      churned: 0
    },
    companyMetrics: {
      totalMRR: 0,
      totalCallsBooked: 0,
      totalDealsClosed: 0
    },
    averageNPS: { current: 0, previous: 0, change: 0, trend: 'neutral' } as NPSData
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const loadMetricsData = () => {
    setIsLoading(true);
    try {
      const clientCounts = getClientsCountByStatus();
      const companyMetrics = getClientMetricsByTeam();
      const averageNPS = getAverageNPS();
      
      setMetricsData({
        clientCounts,
        companyMetrics,
        averageNPS
      });
    } catch (error) {
      console.error("Error loading metrics data:", error);
      toast({
        title: "Data Error",
        description: "Could not load dashboard metrics. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadMetricsData();
    
    // Listen for storage events to detect when data is updated by imports
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('client')) {
        loadMetricsData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [toast]);
  
  // Extract values with null handling
  const active = metricsData.clientCounts.active || 0;
  const atRisk = metricsData.clientCounts["at-risk"] || 0;
  const newClients = metricsData.clientCounts.new || 0;
  const churned = metricsData.clientCounts.churned || 0;
  const total = active + atRisk + newClients + churned;
  
  // Calculate percentages with zero-division protection
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const atRiskPercent = total > 0 ? Math.round((atRisk / total) * 100) : 0;
  const newPercent = total > 0 ? Math.round((newClients / total) * 100) : 0;
  const churnedPercent = total > 0 ? Math.round((churned / total) * 100) : 0;
  const successRate = total > 0 ? Math.round(((active + newClients) / total) * 100) : 0;
  
  // Use the current NPS score from the NPS data
  const npsScore = metricsData.averageNPS.current;
  const npsTrend = metricsData.averageNPS.change > 0 
    ? `+${metricsData.averageNPS.change} points` 
    : `${metricsData.averageNPS.change} points`;
  const npsTrendDirection = metricsData.averageNPS.trend === 'up' ? 'up' : 'down';
  
  const metrics = [
    { 
      title: "Total Clients", 
      value: total,
      trend: '+12% growth',
      trendDirection: 'up'
    },
    { 
      title: "Active Clients", 
      value: active,
      percent: `${activePercent}%`
    },
    { 
      title: "At Risk", 
      value: atRisk,
      percent: `${atRiskPercent}%`
    },
    { 
      title: "New Clients", 
      value: newClients,
      percent: `${newPercent}%`
    },
    { 
      title: "Success Rate", 
      value: `${successRate}%`,
      trend: "+2.5% this quarter",
      trendDirection: 'up'
    },
    { 
      title: "Churn Rate", 
      value: `${churnedPercent}%`,
      trend: "-0.2% this month",
      trendDirection: 'down'
    },
    {
      title: "NPS Score",
      value: npsScore,
      trend: npsTrend,
      trendDirection: npsTrendDirection
    }
  ];
  
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Company Overview</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadMetricsData} 
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-2">
              <div className="text-sm text-gray-600">{metric.title}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              {metric.percent && (
                <div className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 inline-block rounded">
                  {metric.percent}
                </div>
              )}
              {metric.trend && (
                <div className={`flex items-center text-xs ${metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trendDirection === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                  )}
                  <span>{metric.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
