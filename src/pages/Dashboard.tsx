
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { MetricsOverview } from "@/components/Dashboard/MetricsOverview";
import { StudentManagement } from "@/components/Dashboard/StudentManagement";
import { TeamPerformance } from "@/components/Dashboard/TeamPerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllClients, getClientsCountByStatus } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const { 
    data: dashboardData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const clients = getAllClients();
      const clientCounts = getClientsCountByStatus();
      
      return {
        clients,
        clientCounts,
        lastUpdated: new Date().toISOString()
      };
    }
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing dashboard",
      description: "Fetching latest data..."
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="space-y-4 text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to load dashboard data"}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const clients = dashboardData?.clients || [];
  const clientCounts = dashboardData?.clientCounts || { active: 0, "at-risk": 0, new: 0, churned: 0 };
  const lastUpdated = dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated) : new Date();

  // Calculate metrics for the overview
  const totalStudents = clients.length;
  const activeStudents = clientCounts.active || 0;
  const retentionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const monthlyRevenue = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const averageNps = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clients.length) 
    : 0;

  const metricsData = {
    totalClients: totalStudents,
    monthlyRevenue,
    growthRate: 12, // Example fixed value, would be calculated from historical data
    successRate: retentionRate
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <DashboardHeader 
          title="Student Dashboard" 
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />

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
