
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
      color: "success"
    },
    { 
      title: "At Risk Clients", 
      value: clientCounts["at-risk"],
      secondaryText: "-15%",
      trend: 'down' as const,
      icon: AlertTriangle,
      color: "danger" 
    },
    { 
      title: "Total Applications", 
      value: 120,
      secondaryText: "",
      trend: 'neutral' as const,
      icon: Calendar,
      color: "neutral"
    },
    { 
      title: "Total Sales", 
      value: `$${companyMetrics.totalMRR}`,
      secondaryText: "+2%",
      trend: 'up' as const,
      icon: Users,
      color: "success"
    }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {secondaryText && (
              <div className={`flex items-center ${trendColor}`}>
                {TrendIcon && <TrendIcon className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{secondaryText}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
