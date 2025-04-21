
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
      description: "All active accounts",
      "aria-label": `Total client count: ${data.total}`
    },
    {
      title: "Active Clients",
      value: data.active,
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      trend: {
        value: data.success,
        isPositive: true
      },
      description: "Success rate",
      "aria-label": `Active clients: ${data.active}, Success rate: ${data.success}%`
    },
    {
      title: "At-Risk Clients",
      value: data.atRisk,
      icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
      trend: {
        value: data.churn,
        isPositive: false
      },
      description: "Churn rate",
      "aria-label": `At-risk clients: ${data.atRisk}, Churn rate: ${data.churn}%`
    },
    {
      title: "Monthly Growth",
      value: `${data.growthRate || 0}%`,
      icon: <DollarSign className="h-4 w-4 text-blue-500" />,
      trend: {
        value: data.newClients,
        isPositive: true
      },
      description: "New clients this month",
      "aria-label": `Monthly growth: ${data.growthRate || 0}%, New clients: ${data.newClients}`
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
    <Card role="article" aria-label={title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend.isPositive ? (
              <ArrowUp className="h-3 w-3 text-emerald-500" aria-label="Increasing" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" aria-label="Decreasing" />
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

interface UnifiedMetricsGridProps {
  metrics: ReturnType<typeof generateClientMetrics>;
  isLoading?: boolean;
  error?: Error | null;
  columns?: number;
  role?: string;
  "aria-label"?: string;
}

export function UnifiedMetricsGrid({ 
  metrics,
  isLoading = false,
  error = null,
  columns = 4,
  role,
  "aria-label": ariaLabel
}: UnifiedMetricsGridProps) {
  const { toast } = useToast();
  
  if (error) {
    toast({
      title: "Error loading metrics",
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <div 
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`}
      role={role || "region"} 
      aria-label={ariaLabel || "Key metrics overview"}
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
}
