
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Home } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ValidationError } from "@/components/ValidationError";
import { useQueryClient } from "@tanstack/react-query";

// Import our new analytics components
import { CompanyMetrics } from "@/components/Dashboard/CompanyMetrics";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";
import { ClientAnalytics } from "@/components/Dashboard/ClientAnalytics";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { NPSChart } from "@/components/Dashboard/NPSChart";

export default function Analytics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefetching, setIsRefetching] = useState(false);
  const isRefreshing = queryClient.isFetching({queryKey: ['nps-data']}) > 0 || isRefetching;

  const handleRefreshData = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefetching(true);
    
    // Invalidate and refetch all relevant queries
    queryClient.invalidateQueries({
      queryKey: ['nps-data'],
      refetchType: 'active',
    }).then(() => {
      toast({
        title: "Refreshing data",
        description: "Your analytics data is being updated.",
        duration: 3000,
      });
    }).catch(error => {
      toast({
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "An error occurred refreshing the data.",
        variant: "destructive",
        duration: 5000,
      });
    }).finally(() => {
      setIsRefetching(false);
    });
    
  }, [isRefreshing, queryClient, toast]);

  const handleNPSErrorReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nps-data'] });
  }, [queryClient]);

  return (
    <Layout>
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-xl font-bold">Analytics Dashboard</h2>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-8 gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            
            <Button asChild variant="destructive" className="text-white bg-red-600 hover:bg-red-700 h-8 gap-1">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <ErrorBoundary onReset={handleNPSErrorReset}>
            <MetricsCards />
          </ErrorBoundary>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Growth & Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
                    <div className="text-xl font-semibold text-green-600">12%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Avg. Client Value</div>
                    <div className="text-xl font-semibold">$1200</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Client Lifetime</div>
                    <div className="text-xl font-semibold">14.5 months</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Time to Value</div>
                    <div className="text-xl font-semibold">3.2 months</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <NPSChart />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 border rounded-md">
                  <div className="text-sm text-gray-600">Total MRR</div>
                  <div className="text-2xl font-semibold">$4950</div>
                  <div className="text-xs text-green-600">↑ 8%</div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-sm text-gray-600">Calls Booked</div>
                  <div className="text-2xl font-semibold">40</div>
                  <div className="text-xs text-green-600">↑ 12%</div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-sm text-gray-600">Deals Closed</div>
                  <div className="text-2xl font-semibold">9</div>
                  <div className="text-xs text-green-600">↑ 5%</div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-sm text-gray-600">Client Count</div>
                  <div className="text-2xl font-semibold">5</div>
                  <div className="text-xs text-green-600">↑ 3%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium">Retention Rate</div>
                    <div className="text-sm font-semibold text-green-600">40%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600">2 active clients</div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium">At Risk Rate</div>
                    <div className="text-sm font-semibold text-amber-600">20%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600">1 at-risk client</div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium">Churn Rate</div>
                    <div className="text-sm font-semibold text-red-600">20%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600">1 churned client</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ErrorBoundary onReset={handleNPSErrorReset}>
            <ClientAnalytics />
          </ErrorBoundary>
        </div>
      </div>
    </Layout>
  );
}
