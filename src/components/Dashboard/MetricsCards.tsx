
import { 
  Users, 
  AlertTriangle, 
  Phone,
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowDown,
  ArrowUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getClientMetricsByTeam } from "@/lib/data";

export function MetricsCards() {
  const clientCounts = getClientsCountByStatus();
  const companyMetrics = getClientMetricsByTeam();
  const averageNPS = getAverageNPS();
  
  // Add total property if it doesn't exist
  const total = clientCounts.active + clientCounts["at-risk"] + clientCounts.new + clientCounts.churned || 5;
  const clientCountsWithTotal = {
    ...clientCounts,
    total: total
  };
  
  const metrics = [
    { 
      title: "Total Clients", 
      value: clientCountsWithTotal.total,
      trend: '+12% growth',
      trendDirection: 'up'
    },
    { 
      title: "Active Clients", 
      value: clientCounts.active || 2,
      percent: "40%"
    },
    { 
      title: "At Risk", 
      value: clientCounts["at-risk"] || 1,
      percent: "20%"
    },
    { 
      title: "New Clients", 
      value: clientCounts.new || 1,
      percent: "20%"
    },
    { 
      title: "Success Rate", 
      value: "84%",
      trend: "+2.5% this quarter",
      trendDirection: 'up'
    },
    { 
      title: "Churn Rate", 
      value: "1.7%",
      trend: "-0.2% this month",
      trendDirection: 'down'
    }
  ];
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Company Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {metrics.map((metric, index) => (
          <Card key={index} className="border shadow-sm">
            <CardContent className="p-3">
              <div className="text-sm text-gray-600 mb-1">{metric.title}</div>
              <div className="text-2xl font-semibold">{metric.value}</div>
              {metric.percent && (
                <div className="text-xs px-2 py-1 bg-green-100 text-green-800 inline-block rounded mt-1">
                  {metric.percent}
                </div>
              )}
              {metric.trend && (
                <div className={`flex items-center text-xs ${metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {metric.trendDirection === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
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
