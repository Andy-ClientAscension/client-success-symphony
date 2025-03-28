
import { Layout } from "@/components/Layout/Layout";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingState } from "@/components/LoadingState";
import { useQueryClient } from "@tanstack/react-query";
import { ValidationError } from "@/components/ValidationError";

export default function Analytics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isRefreshing = queryClient.isFetching(['nps-data']) > 0;

  const handleRefreshData = useCallback(() => {
    if (isRefreshing) return;
    
    // Invalidate and refetch all relevant queries
    queryClient.invalidateQueries({
      queryKey: ['nps-data'],
    });
    
    toast({
      title: "Refreshing data",
      description: "Your analytics data is being updated.",
    });
  }, [isRefreshing, queryClient, toast]);

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ErrorBoundary 
            fallback={
              <Card className="min-h-[300px] flex items-center justify-center">
                <CardContent>
                  <ValidationError message="Something went wrong loading the NPS chart. Please try refreshing the data." />
                </CardContent>
              </Card>
            }
          >
            <NPSChart />
          </ErrorBoundary>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This dashboard provides detailed analytics about your client relationships and satisfaction metrics.
                Track your Net Promoter Score (NPS) and other key performance indicators.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Client Retention Rate</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <span className="font-semibold">4.2 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Client Growth Rate</span>
                  <span className="font-semibold text-green-600">+12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
