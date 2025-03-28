
import { Layout } from "@/components/Layout/Layout";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, LineChart, Users, Clock, TrendingUp, Home } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingState } from "@/components/LoadingState";
import { useQueryClient } from "@tanstack/react-query";
import { ValidationError } from "@/components/ValidationError";

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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <Button asChild variant="destructive" className="gap-2 text-white bg-red-600 hover:bg-red-700 text-base px-6 py-2 w-full sm:w-auto">
              <Link to="/">
                <Home className="h-5 w-5" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ErrorBoundary 
              fallback={
                <Card className="min-h-[300px] flex items-center justify-center">
                  <CardContent>
                    <ValidationError 
                      message="Something went wrong loading the NPS chart. Please try refreshing the data." 
                      type="error"
                    />
                  </CardContent>
                </Card>
              }
              onReset={handleNPSErrorReset}
            >
              <NPSChart />
            </ErrorBoundary>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                This dashboard provides detailed analytics about your client relationships and satisfaction metrics.
                Track your Net Promoter Score (NPS) and other key performance indicators.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Client Retention Rate</div>
                    <div className="font-semibold text-green-600">87%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Average Response Time</div>
                    <div className="font-semibold">4.2 hours</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Client Growth Rate</div>
                    <div className="font-semibold text-green-600">+12%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
