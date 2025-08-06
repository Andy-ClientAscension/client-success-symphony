
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// Enhanced UI components
import { PageHeader } from "@/components/ui/page-header";
import { EnhancedErrorBoundary } from "@/components/ui/error-boundary-enhanced";
import { MetricCardEnhanced } from "@/components/ui/metric-card-enhanced";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-enhanced";

// Import our analytics components
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
      <div className="flex-1 space-y-6 animate-fade-up">
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Comprehensive view of your business metrics and performance"
          showBackButton
          showHomeButton
          actions={
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="gap-2"
              aria-label="Refresh analytics data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          }
        />
        
        <div className="space-y-6 animate-stagger">
          <EnhancedErrorBoundary 
            onReset={handleNPSErrorReset}
            title="Error Loading Key Metrics"
            showDetails={process.env.NODE_ENV === 'development'}
          >
            <MetricsCards />
          </EnhancedErrorBoundary>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Growth & Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCardEnhanced
                    title="Growth Rate"
                    value="12%"
                    status="positive"
                    trend={{
                      value: 8,
                      direction: 'up',
                      label: 'vs last month'
                    }}
                    className="border-0 shadow-none p-4"
                  />
                  <MetricCardEnhanced
                    title="Avg. Client Value"
                    value="$1200"
                    status="neutral"
                    trend={{
                      value: 5,
                      direction: 'up',
                      label: 'vs last month'
                    }}
                    className="border-0 shadow-none p-4"
                    valueFormatter={(v) => v.toString()}
                  />
                  <MetricCardEnhanced
                    title="Client Lifetime"
                    value="14.5 months"
                    status="positive"
                    className="border-0 shadow-none p-4"
                  />
                  <MetricCardEnhanced
                    title="Time to Value"
                    value="3.2 months"
                    status="positive"
                    trend={{
                      value: 12,
                      direction: 'down',
                      label: 'improvement'
                    }}
                    className="border-0 shadow-none p-4"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedErrorBoundary
                  title="Error Loading Performance Chart"
                  showDetails={false}
                >
                  <NPSChart />
                </EnhancedErrorBoundary>
              </CardContent>
            </Card>
          </div>
          
          <Card className="card-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Team Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCardEnhanced
                  title="Total MRR"
                  value="$4,950"
                  status="positive"
                  trend={{
                    value: 8,
                    direction: 'up',
                    label: 'vs last month'
                  }}
                />
                <MetricCardEnhanced
                  title="Calls Booked"
                  value={40}
                  status="positive"
                  trend={{
                    value: 12,
                    direction: 'up',
                    label: 'vs last month'
                  }}
                />
                <MetricCardEnhanced
                  title="Deals Closed"
                  value={9}
                  status="positive"
                  trend={{
                    value: 5,
                    direction: 'up',
                    label: 'vs last month'
                  }}
                />
                <MetricCardEnhanced
                  title="Client Count"
                  value={5}
                  status="positive"
                  trend={{
                    value: 3,
                    direction: 'up',
                    label: 'vs last month'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-success/20 bg-success/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-foreground">Retention Rate</div>
                      <div className="text-lg font-semibold text-success">40%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all duration-500" 
                        style={{ width: '40%' }}
                        aria-label="40% retention rate"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">2 active clients</div>
                  </CardContent>
                </Card>
                
                <Card className="border border-warning/20 bg-warning/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-foreground">At Risk Rate</div>
                      <div className="text-lg font-semibold text-warning">20%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-warning h-2 rounded-full transition-all duration-500" 
                        style={{ width: '20%' }}
                        aria-label="20% at risk rate"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">1 at-risk client</div>
                  </CardContent>
                </Card>
                
                <Card className="border border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-foreground">Churn Rate</div>
                      <div className="text-lg font-semibold text-destructive">20%</div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-destructive h-2 rounded-full transition-all duration-500" 
                        style={{ width: '20%' }}
                        aria-label="20% churn rate"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">1 churned client</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedErrorBoundary 
            onReset={handleNPSErrorReset}
            title="Error Loading Client Analytics"
            showDetails={process.env.NODE_ENV === 'development'}
          >
            <ClientAnalytics />
          </EnhancedErrorBoundary>
        </div>
      </div>
    </Layout>
  );
}
