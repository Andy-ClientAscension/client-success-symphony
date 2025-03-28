
import { 
  Users, 
  AlertTriangle, 
  UserMinus,
  Calendar, 
  MessageSquare, 
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS } from "@/lib/data";

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  iconColor
}: { 
  title: string, 
  value: string | number, 
  icon: any, 
  trend?: 'up' | 'down' | 'neutral',
  trendValue?: string,
  iconColor: string
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColorClass = trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-danger-600' : '';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${trendColorClass}`}>
                {TrendIcon && <TrendIcon className="h-3 w-3 mr-1" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`${iconColor} rounded-full p-2 bg-opacity-15`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function MetricsCards() {
  const clientCounts = getClientsCountByStatus();
  const averageNPS = getAverageNPS();
  
  const metrics = [
    { 
      title: "Active Clients", 
      value: clientCounts.active,
      icon: Users, 
      trend: 'up' as const, 
      trendValue: "+2 this month",
      iconColor: "text-brand-600"
    },
    { 
      title: "At Risk", 
      value: clientCounts["at-risk"],
      icon: AlertTriangle, 
      trend: 'down' as const, 
      trendValue: "-1 this month",
      iconColor: "text-warning-600"
    },
    { 
      title: "Churn Rate", 
      value: "2.1%",
      icon: UserMinus, 
      trend: 'down' as const, 
      trendValue: "-0.3% from last month",
      iconColor: "text-danger-600"
    },
    { 
      title: "Upcoming Renewals", 
      value: 3,
      icon: Calendar, 
      trend: 'neutral' as const, 
      trendValue: "Next in 22 days",
      iconColor: "text-brand-600"
    },
    { 
      title: "Comm. Pending", 
      value: 8,
      icon: MessageSquare, 
      trend: 'up' as const, 
      trendValue: "+3 this week",
      iconColor: "text-brand-600"
    },
    { 
      title: "Revenue MRR", 
      value: "$5,700",
      icon: CreditCard, 
      trend: 'up' as const, 
      trendValue: "+5% from last month",
      iconColor: "text-success-600"
    },
    { 
      title: "NPS Score", 
      value: averageNPS,
      icon: TrendingUp, 
      trend: 'up' as const, 
      trendValue: "+0.5 this quarter",
      iconColor: "text-success-600"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard 
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          trendValue={metric.trendValue}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  );
}
