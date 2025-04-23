import React from 'react';
import { Layout } from "@/components/Layout/Layout";
import { DashboardKPIHeader } from "@/components/Dashboard/Metrics/DashboardKPIHeader";
import { SSCPerformanceOverview } from "@/components/Dashboard/Performance/SSCPerformanceOverview";
import { HealthJourneyTracker } from "@/components/Dashboard/Health/HealthJourneyTracker";
import { ClientList } from "@/components/Dashboard/ClientList";
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics/CompanyMetrics";
import { Card } from "@/components/ui/card";
import { SyncStatus } from "@/components/SyncStatus";
import { useSyncedData } from "@/hooks/useSyncedData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
            <CompanyMetrics />
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
