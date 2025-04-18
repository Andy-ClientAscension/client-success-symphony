
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { TeamMetricCard } from "../TeamMetricCard";

interface PerformanceMetricsData {
  totalClients?: number;
  totalMRR: number;
  totalCallsBooked: number;
  totalDealsClosed: number;
  averageRevenuePerClient?: number;
  conversionRate?: number;
}

interface PerformanceMetricsProps {
  data: PerformanceMetricsData;
  variant?: "compact" | "detailed";
  title?: string;
}

export function PerformanceMetrics({
  data,
  variant = "detailed",
  title
}: PerformanceMetricsProps) {
  const {
    totalMRR,
    totalCallsBooked,
    totalDealsClosed,
    totalClients,
    averageRevenuePerClient,
    conversionRate
  } = data;

  // Calculate derived metrics if not provided
  const avgRevenue = averageRevenuePerClient || 
    (totalClients && totalClients > 0 ? Math.round(totalMRR / totalClients) : 0);
  
  const conversion = conversionRate || 
    (totalCallsBooked > 0 ? Math.round((totalDealsClosed / totalCallsBooked) * 100) : 0);

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">Revenue</div>
            <div className="text-lg font-semibold">${totalMRR}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">Calls</div>
            <div className="text-lg font-semibold">{totalCallsBooked}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">Deals</div>
            <div className="text-lg font-semibold">{totalDealsClosed}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">Conversion</div>
            <div className="text-lg font-semibold">{conversion}%</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {totalClients !== undefined && (
          <TeamMetricCard
            title="Total Clients"
            value={totalClients}
            icon={<Users className="h-4 w-4 mr-1" />}
            trend={2.5}
          />
        )}
        
        <TeamMetricCard
          title="Monthly Revenue"
          value={`$${totalMRR}`}
          icon={<DollarSign className="h-4 w-4 mr-1" />}
          trend={3.2}
        />
        
        <TeamMetricCard
          title="Calls Booked"
          value={totalCallsBooked}
          icon={<Phone className="h-4 w-4 mr-1" />}
          trend={1.8}
        />
        
        <TeamMetricCard
          title="Deals Closed"
          value={totalDealsClosed}
          icon={<Calendar className="h-4 w-4 mr-1" />}
          trend={4.1}
        />
        
        <TeamMetricCard
          title="Conversion Rate"
          value={`${conversion}%`}
          icon={<TrendingUp className="h-4 w-4 mr-1" />}
          trend={0.5}
        />
      </div>
    </div>
  );
}
