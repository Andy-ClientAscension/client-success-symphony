
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { MetricsOverview } from "@/components/Dashboard/MetricsOverview";
import { StudentManagement } from "@/components/Dashboard/StudentManagement";
import { TeamPerformance } from "@/components/Dashboard/TeamPerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";
import { LoadingState } from "@/components/LoadingState";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const {
    clients,
    clientCounts,
    npsScore,
    isLoading,
    error,
    refreshData,
    isRefreshing,
    lastUpdated
  } = useSyncedDashboard();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingState message="Loading dashboard data..." showProgress />
        </div>
      </Layout>
    );
  }

  if (error && clients.length === 0) {
    return (
      <Layout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Dashboard</AlertTitle>
              <AlertDescription>
                {error.message || "Failed to load dashboard data"}
              </AlertDescription>
            </Alert>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Calculate metrics for the overview
  const totalStudents = clients.length;
  const activeStudents = clientCounts.active || 0;
  const retentionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const monthlyRevenue = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const averageNps = npsScore || 0;

  const metricsData = {
    totalClients: totalStudents,
    monthlyRevenue,
    growthRate: 12, // Example fixed value, would be calculated from historical data
    successRate: retentionRate
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <DashboardHeader 
            title="Student Dashboard" 
            lastUpdated={lastUpdated || new Date()}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
          />
          <RealtimeSyncIndicator />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync Warning</AlertTitle>
            <AlertDescription>
              {error.message}. Using cached data. Click refresh to try again.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Metrics Overview</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <MetricsOverview data={metricsData} />
          </TabsContent>
          
          <TabsContent value="students" className="space-y-6">
            <StudentManagement clients={clients} />
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6">
            <TeamPerformance clients={clients} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
