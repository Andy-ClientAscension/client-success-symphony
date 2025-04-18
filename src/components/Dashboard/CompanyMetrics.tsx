
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from "@/lib/data";
import { MetricsGrid, GrowthRetentionSection, PerformanceTrends } from "@/components/Dashboard/Metrics";

export function CompanyMetrics() {
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
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Company Overview</CardTitle>
      </CardHeader>
      
      <CardContent>
        <MetricsGrid 
          totalClients={totalClients}
          growthRate={growthRate}
          clientCounts={clientCounts}
          percentages={{
            activeClientsPercentage,
            atRiskPercentage,
            newPercentage
          }}
          successRate={successRate}
          churnRate={churnData[churnData.length - 1].rate}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <GrowthRetentionSection 
            growthRate={growthRate}
            avgClientValue={avgClientValue}
            clientLifetimeMonths={clientLifetimeMonths}
            averageTimeToValue={averageTimeToValue}
          />
          
          <PerformanceTrends 
            npsMonthlyData={npsMonthlyData}
            churnData={churnData}
          />
        </div>
      </CardContent>
    </Card>
  );
}
