
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from "@/lib/data";
import { MetricsGrid } from "@/components/Dashboard/Metrics";
import { StatusDistribution, PerformanceMetrics } from "./Shared";
import { calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { getAllClients } from "@/lib/data";

export function CompanyMetrics() {
  const clients = getAllClients();
  const clientCounts = getClientsCountByStatus();
  const npsMonthlyData = getNPSMonthlyTrend();
  const churnData = getChurnData();
  
  const totalClients = Object.values(clientCounts).reduce((a, b) => a + b, 0);
  const activeClientsPercentage = Math.round((clientCounts.active / totalClients) * 100);
  const atRiskPercentage = Math.round((clientCounts["at-risk"] / totalClients) * 100);
  const churnedPercentage = Math.round((clientCounts.churned / totalClients) * 100);
  const newPercentage = Math.round((clientCounts.new / totalClients) * 100);
  
  // Growth metrics (simulated)
  const growthRate = 12; // 12% growth rate
  const avgClientValue = 1200; // $1200 average client value
  const clientLifetimeMonths = 14.5; // Average client stays 14.5 months
  
  // Success metrics (simulated)
  const successRate = 84; // 84% success rate
  const averageTimeToValue = 3.2; // 3.2 months to value

  // Calculate performance metrics from clients
  const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
  const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
  
  // Status counts and rates for StatusDistribution
  const statusCounts = {
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    churned: clientCounts.churned,
    total: totalClients
  };
  
  const rates = {
    retentionRate: activeClientsPercentage,
    atRiskRate: atRiskPercentage,
    churnRate: churnedPercentage
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Company Overview</CardTitle>
      </CardHeader>
      
      <CardContent>
        <MetricsGrid 
          totalClients={totalClients}
          growthRate={growthRate}
          clientCounts={{
            active: clientCounts.active,
            "at-risk": clientCounts["at-risk"],
            new: clientCounts.new
          }}
          percentages={{
            activeClientsPercentage,
            atRiskPercentage,
            newPercentage
          }}
          successRate={successRate}
          churnRate={churnData[churnData.length - 1].rate}
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Client Status Distribution</h3>
            <StatusDistribution 
              statusCounts={statusCounts}
              rates={rates}
            />
          </div>
          
          <div className="space-y-4">
            <PerformanceMetrics 
              data={{
                totalClients,
                totalMRR,
                totalCallsBooked,
                totalDealsClosed,
                averageRevenuePerClient: avgClientValue
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
