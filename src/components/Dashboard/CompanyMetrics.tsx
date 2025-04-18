
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getClientsCountByStatus, getAllClients } from "@/lib/data";
import { UnifiedDashboardMetrics } from "./Metrics/UnifiedDashboardMetrics";
import { calculateRates } from "@/utils/analyticsUtils";

export function CompanyMetrics() {
  const clients = getAllClients();
  const clientCounts = getClientsCountByStatus();
  
  const totalClients = Object.values(clientCounts).reduce((a, b) => a + b, 0);
  
  const statusCounts = {
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    churned: clientCounts.churned,
    new: clientCounts.new, // Adding the missing 'new' property
    total: totalClients
  };
  
  const rates = calculateRates(statusCounts);
  
  // Calculate performance metrics from clients
  const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
  const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);

  const consolidatedMetrics = {
    total: totalClients,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: rates.churnRate,
    success: rates.retentionRate,
    mrr: totalMRR,
    growthRate: 12 // Example growth rate
  };

  const performanceData = {
    totalMRR,
    totalCallsBooked,
    totalDealsClosed,
    totalClients
  };

  return (
    <Card>
      <CardContent className="p-6">
        <UnifiedDashboardMetrics 
          metrics={consolidatedMetrics}
          statusCounts={statusCounts}
          rates={rates}
          performanceData={performanceData}
          variant="detailed"
        />
      </CardContent>
    </Card>
  );
}
