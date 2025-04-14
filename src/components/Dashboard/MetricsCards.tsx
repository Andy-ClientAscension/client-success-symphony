
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
  
  // Calculate total with null handling
  const active = clientCounts.active || 0;
  const atRisk = clientCounts["at-risk"] || 0;
  const newClients = clientCounts.new || 0;
  const churned = clientCounts.churned || 0;
  const total = active + atRisk + newClients + churned;
  
  // Calculate percentages with zero-division protection
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const atRiskPercent = total > 0 ? Math.round((atRisk / total) * 100) : 0;
  const newPercent = total > 0 ? Math.round((newClients / total) * 100) : 0;
  const churnedPercent = total > 0 ? Math.round((churned / total) * 100) : 0;
  
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
      value: `${(total > 0 ? Math.round(((active + newClients) / total) * 100) : 0)}%`,
      trend: "+2.5% this quarter",
      trendDirection: 'up'
    },
    { 
      title: "Churn Rate", 
      value: `${churnedPercent}%`,
      trend: "-0.2% this month",
      trendDirection: 'down'
    }
  ];
  
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold mb-2">Company Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
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
