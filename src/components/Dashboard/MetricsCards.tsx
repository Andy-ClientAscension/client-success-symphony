
import { 
  Users, 
  AlertTriangle, 
  UserMinus,
  Calendar, 
  MessageSquare, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Building,
  Phone,
  BarChart2,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getClientMetricsByTeam } from "@/lib/data";

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
  const trendColorClass = trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-red-600' : '';
  
  return (
    <Card className="border border-red-100">
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
  const companyMetrics = getClientMetricsByTeam();
  
  const metrics = [
    { 
      title: "Total Active Clients", 
      value: clientCounts.active,
      icon: Users, 
      trend: 'up' as const, 
      trendValue: "+2 this month",
      iconColor: "text-red-600"
    },
    { 
      title: "At Risk Clients", 
      value: clientCounts["at-risk"],
      icon: AlertTriangle, 
      trend: 'down' as const, 
      trendValue: "-1 this month",
      iconColor: "text-warning-600"
    },
    { 
      title: "Company Churn Rate", 
      value: "2.1%",
      icon: UserMinus, 
      trend: 'down' as const, 
      trendValue: "-0.3% from last month",
      iconColor: "text-red-600"
    },
    { 
      title: "Upcoming Renewals", 
      value: 3,
      icon: Calendar, 
      trend: 'neutral' as const, 
      trendValue: "Next in 22 days",
      iconColor: "text-red-600"
    },
    { 
      title: "Pending Communications", 
      value: 8,
      icon: MessageSquare, 
      trend: 'up' as const, 
      trendValue: "+3 this week",
      iconColor: "text-red-600"
    },
    { 
      title: "Total MRR", 
      value: `$${companyMetrics.totalMRR}`,
      icon: CreditCard, 
      trend: 'up' as const, 
      trendValue: "+5% from last month",
      iconColor: "text-success-600"
    },
    { 
      title: "Company NPS Score", 
      value: averageNPS,
      icon: TrendingUp, 
      trend: 'up' as const, 
      trendValue: "+0.5 this quarter",
      iconColor: "text-success-600"
    },
    { 
      title: "Total Calls Booked", 
      value: companyMetrics.totalCallsBooked,
      icon: Phone, 
      trend: 'up' as const, 
      trendValue: "+12 this month",
      iconColor: "text-red-600"
    },
    { 
      title: "Total Deals Closed", 
      value: companyMetrics.totalDealsClosed,
      icon: BarChart2, 
      trend: 'up' as const, 
      trendValue: "+3 this month",
      iconColor: "text-success-600"
    }
  ];
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2 text-red-600" />
        Company Overview (All Teams)
      </h2>
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
    </div>
  );
}
