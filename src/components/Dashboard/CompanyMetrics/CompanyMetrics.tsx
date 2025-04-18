
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData, getAllClients } from "@/lib/data";
import { CompanySummary } from "./CompanySummary";
import { ClientDistribution } from "./ClientDistribution";
import { PerformanceIndicators } from "./PerformanceIndicators";
import { calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";

export function CompanyMetrics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const clients = getAllClients();
      const clientCounts = getClientsCountByStatus();
      const npsMonthlyData = getNPSMonthlyTrend();
      const churnData = getChurnData();
      
      const totalClients = Object.values(clientCounts).reduce((a, b) => a + b, 0);
      
      setData({
        clients,
        clientCounts,
        npsMonthlyData,
        churnData,
        metrics: {
          totalClients,
          activeClientsPercentage: Math.round((clientCounts.active / totalClients) * 100),
          atRiskPercentage: Math.round((clientCounts["at-risk"] / totalClients) * 100),
          churnedPercentage: Math.round((clientCounts.churned / totalClients) * 100),
          newPercentage: Math.round((clientCounts.new / totalClients) * 100),
          growthRate: 12,
          avgClientValue: 1200,
          clientLifetimeMonths: 14.5,
          successRate: 84,
          averageTimeToValue: 3.2
        }
      });
    } catch (err) {
      console.error("Error loading metrics:", err);
      setError(err instanceof Error ? err : new Error("Failed to load metrics"));
      toast({
        title: "Error Loading Metrics",
        description: "Failed to load company metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent>
          <LoadingState message="Loading company metrics..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent>
          <ValidationError
            type="error"
            message={error.message}
            title="Error Loading Metrics"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="shadow-sm">
        <CardContent>
          <EmptyState
            title="No Metrics Available"
            message="There are no metrics to display at this time."
          />
        </CardContent>
      </Card>
    );
  }

  const { clients, clientCounts, npsMonthlyData, churnData, metrics } = data;

  const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
  const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
  
  const statusCounts = {
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    churned: clientCounts.churned,
    total: metrics.totalClients
  };
  
  const rates = {
    retentionRate: metrics.activeClientsPercentage,
    atRiskRate: metrics.atRiskPercentage,
    churnRate: metrics.churnedPercentage
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Company Overview</CardTitle>
      </CardHeader>
      
      <CardContent>
        <CompanySummary
          totalClients={metrics.totalClients}
          growthRate={metrics.growthRate}
          clientCounts={{
            active: clientCounts.active,
            "at-risk": clientCounts["at-risk"],
            new: clientCounts.new
          }}
          percentages={{
            activeClientsPercentage: metrics.activeClientsPercentage,
            atRiskPercentage: metrics.atRiskPercentage,
            newPercentage: metrics.newPercentage
          }}
          successRate={metrics.successRate}
          churnRate={churnData[churnData.length - 1].rate}
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientDistribution 
            statusCounts={statusCounts}
            rates={rates}
          />
          
          <PerformanceIndicators 
            data={{
              totalClients: metrics.totalClients,
              totalMRR,
              totalCallsBooked,
              totalDealsClosed,
              averageRevenuePerClient: metrics.avgClientValue
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
