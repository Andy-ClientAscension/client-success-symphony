
import React from 'react';
import { Layout } from "@/components/Layout/Layout";
import { DashboardKPIHeader } from "@/components/Dashboard/Metrics/DashboardKPIHeader";
import { PerformanceTrends } from "@/components/Dashboard/Metrics/PerformanceTrends";
import { SSCPerformanceOverview } from "@/components/Dashboard/Performance/SSCPerformanceOverview";
import { HealthJourneyTracker } from "@/components/Dashboard/Health/HealthJourneyTracker";
import { ClientList } from "@/components/Dashboard/ClientList";
import { Card } from "@/components/ui/card";
import { SyncStatus } from "@/components/SyncStatus";
import { useSyncedData } from "@/hooks/useSyncedData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { HealthScoreOverview } from "@/components/Dashboard/HealthScore/HealthScoreOverview";
import { HealthScoreSummary } from "@/components/Dashboard/HealthScore/HealthScoreSummary";

export default function Dashboard() {
  const { data, error, isLoading, lastUpdated, isRefreshing } = useSyncedData();

  return (
    <Layout>
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <SyncStatus status={{ lastUpdated, isRefreshing }} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading the dashboard data. Some information might be outdated.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        ) : (
          <>
            <DashboardKPIHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceTrends 
                npsMonthlyData={[
                  { month: "Jan", score: 8.2 },
                  { month: "Feb", score: 7.9 },
                  { month: "Mar", score: 8.5 },
                  { month: "Apr", score: 8.1 },
                  { month: "May", score: 8.4 },
                  { month: "Jun", score: 8.7 }
                ]}
                churnData={[
                  { month: "Jan", rate: 2.1 },
                  { month: "Feb", rate: 1.8 },
                  { month: "Mar", rate: 2.3 },
                  { month: "Apr", rate: 1.9 },
                  { month: "May", rate: 2.2 },
                  { month: "Jun", rate: 1.7 }
                ]}
              />
              <HealthScoreOverview clients={data?.clients || []} />
            </div>

            <HealthScoreSummary clients={data?.clients || []} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SSCPerformanceOverview />
                <Card className="p-6">
                  <ClientList />
                </Card>
              </div>
              <aside className="lg:col-span-1">
                <HealthJourneyTracker />
              </aside>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}
