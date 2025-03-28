
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
      <div className="flex-1 space-y-0 p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0">
          <div className="flex items-center space-x-0.5">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-4 w-4">
                <ArrowLeft className="h-2 w-2" />
              </Button>
            </Link>
            <h2 className="text-[8px] md:text-xs font-bold tracking-tight">Analytics Dashboard</h2>
          </div>
          
          <div className="flex gap-0.5">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-4 text-[6px] w-full sm:w-auto px-1"
            >
              <RefreshCw className={`h-1.5 w-1.5 mr-0.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <Button asChild variant="destructive" className="gap-0.5 text-white bg-red-600 hover:bg-red-700 text-[6px] h-4 w-full sm:w-auto px-1">
              <Link to="/">
                <Home className="h-1.5 w-1.5" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3 mt-0.5">
          <div className="lg:col-span-2">
            <ErrorBoundary 
              fallback={
                <Card className="min-h-[70px] flex items-center justify-center">
                  <CardContent>
                    <ValidationError 
                      message="Something went wrong loading the NPS chart. Please try refreshing the data." 
                      type="error"
                      className="text-[6px]"
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
            <CardHeader className="p-0.5">
              <CardTitle className="text-[8px]">Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0.5 pt-0">
              <p className="text-[6px] text-muted-foreground mb-0.5">
                This dashboard provides detailed analytics about your client relationships and satisfaction metrics.
                Track your Net Promoter Score (NPS) and other key performance indicators.
              </p>
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
                    <Users className="h-1.5 w-1.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[6px] font-medium">Client Retention Rate</div>
                    <div className="font-semibold text-[6px] text-green-600">87%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-1.5 w-1.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[6px] font-medium">Average Response Time</div>
                    <div className="font-semibold text-[6px]">4.2 hours</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-card/50">
                  <div className="p-0.5 rounded-md bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="h-1.5 w-1.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[6px] font-medium">Client Growth Rate</div>
                    <div className="font-semibold text-[6px] text-green-600">+12%</div>
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
