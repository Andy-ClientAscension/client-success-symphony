
import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
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
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">Analytics Dashboard</h2>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="h-8 text-xs w-full sm:w-auto px-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <Button asChild variant="destructive" className="gap-2 text-white bg-red-600 hover:bg-red-700 text-xs h-8 w-full sm:w-auto px-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Company Overview */}
          <ErrorBoundary 
            fallback={
              <Card className="min-h-[100px] flex items-center justify-center">
                <ValidationError 
                  message="Something went wrong loading the company metrics." 
                  type="error"
                  className="text-sm"
                />
              </Card>
            }
            onReset={handleNPSErrorReset}
          >
            <CompanyMetrics />
          </ErrorBoundary>
          
          {/* Team Analytics */}
          <ErrorBoundary 
            fallback={
              <Card className="min-h-[100px] flex items-center justify-center">
                <ValidationError 
                  message="Something went wrong loading the team analytics." 
                  type="error"
                  className="text-sm"
                />
              </Card>
            }
            onReset={handleNPSErrorReset}
          >
            <TeamAnalytics />
          </ErrorBoundary>
          
          {/* Client Analytics */}
          <ErrorBoundary 
            fallback={
              <Card className="min-h-[100px] flex items-center justify-center">
                <ValidationError 
                  message="Something went wrong loading the client analytics." 
                  type="error"
                  className="text-sm"
                />
              </Card>
            }
            onReset={handleNPSErrorReset}
          >
            <ClientAnalytics />
          </ErrorBoundary>
        </div>
      </div>
    </Layout>
  );
}
