
import { 
  Users, 
  AlertTriangle, 
  UserMinus,
  Calendar, 
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getClientMetricsByTeam } from "@/lib/data";

export function MetricsCards() {
  const clientCounts = getClientsCountByStatus();
  const companyMetrics = getClientMetricsByTeam();
  
  const metrics = [
    { 
      title: "Total Active Clients", 
      value: clientCounts.active,
      secondaryText: "+3.5%",
      trend: 'up' as const,
      icon: Users,
      color: "success" as const
    },
    { 
      title: "At Risk Clients", 
      value: clientCounts["at-risk"],
      secondaryText: "-15%",
      trend: 'down' as const,
      icon: AlertTriangle,
      color: "danger" as const
    },
    { 
      title: "Total Applications", 
      value: 120,
      secondaryText: "",
      trend: 'neutral' as const,
      icon: Calendar,
      color: "neutral" as const
    },
    { 
      title: "Total Sales", 
      value: `$${companyMetrics.totalMRR}`,
      secondaryText: "+2%",
      trend: 'up' as const,
      icon: Users,
      color: "success" as const
    }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            secondaryText={metric.secondaryText}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>
    </div>
  );
}

const MetricCard = ({ 
  title, 
  value, 
  secondaryText,
  trend,
  icon: Icon,
  color
}: { 
  title: string;
  value: string | number;
  secondaryText: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: 'success' | 'danger' | 'neutral';
}) => {
  const trendColor = 
    trend === 'up' ? 'text-green-600' : 
    trend === 'down' ? 'text-red-600' : 
    'text-gray-600';
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  const bgColorMap = {
    success: 'bg-success-50',
    danger: 'bg-red-50',
    neutral: 'bg-gray-50'
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-col">
          <p className="text-xs text-gray-600">{title}</p>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-lg font-bold">{value}</h3>
            {secondaryText && (
              <div className={`flex items-center ${trendColor}`}>
                {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
                <span className="text-xs font-medium">{secondaryText}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
