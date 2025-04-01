
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
  
  const metrics = [
    { 
      title: "At Risk Clients", 
      value: clientCounts["at-risk"],
      secondaryText: "-1 this month",
      trend: 'down' as const,
      icon: ArrowDown,
      color: "text-red-600" as const
    },
    { 
      title: "Company Churn Rate", 
      value: "2.1%",
      secondaryText: "-0.3% from last month",
      trend: 'down' as const,
      icon: ArrowDown,
      color: "text-red-600" as const
    },
    { 
      title: "Upcoming Renewals", 
      value: 3,
      secondaryText: "Next in 22 days",
      trend: 'neutral' as const,
      icon: Calendar,
      color: "text-gray-500" as const
    },
    { 
      title: "Total MRR", 
      value: `$${companyMetrics.totalMRR}`,
      secondaryText: "+5% from last month",
      trend: 'up' as const,
      icon: ArrowUp,
      color: "text-green-600" as const
    },
    { 
      title: "Company NPS Score", 
      value: averageNPS,
      secondaryText: "+0.5 this quarter",
      trend: 'up' as const,
      icon: ArrowUp,
      color: "text-green-600" as const
    },
    { 
      title: "Total Calls Booked", 
      value: 40,
      secondaryText: "+12 this month",
      trend: 'up' as const,
      icon: ArrowUp,
      color: "text-green-600" as const
    }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
  color: string;
}) => {  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="mb-1 text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
      <div className={`flex items-center text-xs ${color} mt-1`}>
        <Icon className="h-3 w-3 mr-1" />
        <span>{secondaryText}</span>
      </div>
    </div>
  );
}
