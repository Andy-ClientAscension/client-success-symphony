
import { Layout } from "@/components/Layout/Layout";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, LineChart, Users, Clock, TrendingUp, Home } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ValidationError } from "@/components/ValidationError";
import { useQueryClient } from "@tanstack/react-query";

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
      <div className="flex-1 space-y-1 p-1 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center space-x-1">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-6 w-6">
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </Link>
            <h2 className="text-sm md:text-base font-bold tracking-tight">Analytics Dashboard</h2>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-6 text-xs w-full sm:w-auto"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <Button asChild variant="destructive" className="gap-1 text-white bg-red-600 hover:bg-red-700 text-xs h-6 w-full sm:w-auto">
              <Link to="/">
                <Home className="h-3 w-3" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ErrorBoundary 
              fallback={
                <Card className="min-h-[150px] flex items-center justify-center">
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
            <CardHeader className="p-1">
              <CardTitle className="text-xs">Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-1 pt-0">
              <p className="text-[8px] text-muted-foreground mb-1">
                This dashboard provides detailed analytics about your client relationships and satisfaction metrics.
                Track your Net Promoter Score (NPS) and other key performance indicators.
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
                    <Users className="h-2 w-2 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[8px] font-medium">Client Retention Rate</div>
                    <div className="font-semibold text-[8px] text-green-600">87%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-2 w-2 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[8px] font-medium">Average Response Time</div>
                    <div className="font-semibold text-[8px]">4.2 hours</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="h-2 w-2 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[8px] font-medium">Client Growth Rate</div>
                    <div className="font-semibold text-[8px] text-green-600">+12%</div>
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
