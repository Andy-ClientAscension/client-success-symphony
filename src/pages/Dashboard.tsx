
import React from "react";
import { Layout } from "@/components/Layout/Layout";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart2, Users, FileText, TrendingUp } from "lucide-react";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";
import { LoadingState } from "@/components/LoadingState";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";
import { HeroMetrics } from "@/components/Dashboard/Metrics/HeroMetrics";
import { StudentsData } from "@/components/StudentsData";

export default function Dashboard() {
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

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <DashboardHeader 
            title="Executive Dashboard" 
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

        {/* Key Metrics Section */}
        <HeroMetrics className="mb-6" />

        {/* Quick links section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-md transition-all duration-200">
            <Link to="/analytics" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View detailed reports and metrics</p>
                </div>
              </div>
            </Link>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <Link to="/clients" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-medium">Students</h3>
                  <p className="text-sm text-muted-foreground">Manage student profiles</p>
                </div>
              </div>
            </Link>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <Link to="/renewals" className="block p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-medium">Renewals</h3>
                  <p className="text-sm text-muted-foreground">Track and manage renewals</p>
                </div>
              </div>
            </Link>
          </Card>
        </section>

        {/* Recent students list */}
        <StudentsData />
      </div>
    </Layout>
  );
}
