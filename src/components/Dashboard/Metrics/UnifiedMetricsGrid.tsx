
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, ArrowDown, Users, DollarSign, TrendingUp, Activity } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export interface ClientMetrics {
  total: number;
  active: number;
  atRisk: number;
  newClients: number;
  churn: number;
  success: number;
  mrr?: number;
  nps?: number;
  growthRate?: number;
}

export function generateClientMetrics(data: ClientMetrics) {
  return [
    {
      title: "Total Clients",
      value: data.total,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "All active accounts"
    },
    {
      title: "Active Clients",
      value: data.active,
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      trend: {
        value: data.success,
        isPositive: true
      },
      description: "Success rate"
    },
    {
      title: "At-Risk Clients",
      value: data.atRisk,
      icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
      trend: {
        value: data.churn,
        isPositive: false
      },
      description: "Churn rate"
    },
    {
      title: "Monthly Growth",
      value: `${data.growthRate || 0}%`,
      icon: <DollarSign className="h-4 w-4 text-blue-500" />,
      trend: {
        value: data.newClients,
        isPositive: true
      },
      description: "New clients this month"
    }
  ];
}

function MetricCard({ title, value, description, icon, trend, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[80px] mb-2" />
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend.isPositive ? (
              <ArrowUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? "text-emerald-500" : "text-red-500"}>
              {trend.value}%
            </span>{" "}
            {description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function UnifiedMetricsGrid({ 
  metrics,
  isLoading = false,
  error = null,
  columns = 4 // Add the columns prop with a default value of 4
}: { 
  metrics: ReturnType<typeof generateClientMetrics>;
  isLoading?: boolean;
  error?: Error | null;
  columns?: number; // Add the columns prop to the interface
}) {
  const { toast } = useToast();
  
  if (error) {
    toast({
      title: "Error loading metrics",
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
}
