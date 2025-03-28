
import { 
  Users, 
  AlertTriangle, 
  Phone,
  Calendar, 
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getClientMetricsByTeam } from "@/lib/data";

export function MetricsCards() {
  const clientCounts = getClientsCountByStatus();
  const companyMetrics = getClientMetricsByTeam();
  const averageNPS = getAverageNPS();
  
  const metrics = [
    { 
      title: "At Risk Clients", 
      value: clientCounts["at-risk"],
      secondaryText: "-1 this month",
      trend: 'down' as const,
      icon: AlertTriangle,
      color: "danger" as const
    },
    { 
      title: "Company Churn Rate", 
      value: "2.1%",
      secondaryText: "-0.3% from last month",
      trend: 'down' as const,
      icon: TrendingDown,
      color: "danger" as const
    },
    { 
      title: "Upcoming Renewals", 
      value: 3,
      secondaryText: "Next in 22 days",
      trend: 'neutral' as const,
      icon: Calendar,
      color: "neutral" as const
    },
    { 
      title: "Total MRR", 
      value: `$${companyMetrics.totalMRR}`,
      secondaryText: "+5% from last month",
      trend: 'up' as const,
      icon: DollarSign,
      color: "success" as const
    },
    { 
      title: "Company NPS Score", 
      value: averageNPS,
      secondaryText: "+0.5 this quarter",
      trend: 'up' as const,
      icon: TrendingUp,
      color: "success" as const
    },
    { 
      title: "Total Calls Booked", 
      value: 40,
      secondaryText: "+12 this month",
      trend: 'up' as const,
      icon: Phone,
      color: "success" as const
    }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
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
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-col">
          <p className="text-xs text-gray-600">{title}</p>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold">{value}</h3>
            {secondaryText && (
              <div className={`flex items-center ${trendColor} text-xs`}>
                {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
                <span>{secondaryText}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
