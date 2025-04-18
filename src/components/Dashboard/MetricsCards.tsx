
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, DollarSign, PhoneCall, Calendar } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function MetricsCards() {
  const { metrics, clientCounts, error } = useDashboardData();

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error loading metrics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalClients = clientCounts 
    ? Object.values(clientCounts).reduce((sum, count) => sum + count, 0) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <h3 className="text-2xl font-semibold">{totalClients}</h3>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>5% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-semibold">${metrics?.totalMRR || 0}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>8% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calls Booked</p>
              <h3 className="text-2xl font-semibold">{metrics?.totalCallsBooked || 0}</h3>
            </div>
            <PhoneCall className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>12% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Deals Closed</p>
              <h3 className="text-2xl font-semibold">{metrics?.totalDealsClosed || 0}</h3>
            </div>
            <Calendar className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-amber-600 flex items-center mt-2">
            <ArrowDown className="h-3 w-3 mr-1" />
            <span>3% from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
