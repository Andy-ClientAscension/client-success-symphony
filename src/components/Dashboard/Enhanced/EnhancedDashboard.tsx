import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '../Layout/DashboardSidebar';
import { Users, Heart, DollarSign, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { SearchBar } from '@/components/Navigation/SearchBar';
import { NotificationBell } from '@/components/Navigation/NotificationBell';
import { Breadcrumbs } from '@/components/Navigation/Breadcrumbs';
import UniversalErrorBoundary from '@/components/ErrorBoundary/UniversalErrorBoundary';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { announceToScreenReader, reducedMotionConfig } from '@/lib/accessibility';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load heavy components
const ChartComponents = React.lazy(() => import('./ChartComponents'));
const RealTimeAIPanel = React.lazy(() => import('../RealTimeAI/RealTimeAIPanel').then(m => ({ default: m.RealTimeAIPanel })));

// Loading skeleton component
const MetricSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-6 w-16 bg-muted rounded"></div>
          <div className="h-3 w-20 bg-muted rounded"></div>
        </div>
        <div className="h-10 w-10 bg-muted rounded-lg"></div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced metric card with accessibility
const AccessibleMetricCard = React.memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default',
  isLoading = false 
}: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}) => {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive'
  };

  if (isLoading) return <MetricSkeleton />;

  return (
    <Card 
      className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-ring"
      role="region"
      aria-labelledby={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p 
              id={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {title}
            </p>
            <p 
              className="text-xl font-bold text-foreground"
              aria-label={`${title}: ${value}`}
            >
              {value}
            </p>
            <p 
              className="text-xs text-success flex items-center gap-1"
              aria-label={`Change: ${change}`}
            >
              <span className="sr-only">Trend:</span>
              {change}
            </p>
          </div>
          <div 
            className={cn("h-10 w-10 rounded-lg flex items-center justify-center", variantClasses[variant])}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Error fallback component
const DashboardErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px]" role="alert">
    <Card className="max-w-md">
      <CardContent className="p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold">Dashboard Error</h3>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Empty state component
const DashboardEmptyState = () => (
  <div className="flex items-center justify-center min-h-[400px]" role="status" aria-live="polite">
    <Card className="max-w-md">
      <CardContent className="p-6 text-center space-y-4">
        <Users className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold">No Data Available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            There's no client data to display. Try refreshing or check your data source.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EnhancedDashboard = React.memo(() => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use the proper data hook with error handling - will return mock data automatically
  const { 
    allClients, 
    teamStatusCounts, 
    teamMetrics, 
    isLoading, 
    error, 
    refreshData,
    lastUpdated 
  } = useDashboardData({ 
    enableAutoSync: true 
  });

  // Handle refresh with accessibility announcements
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    announceToScreenReader('Refreshing dashboard data', 'polite');
    
    try {
      await refreshData();
      announceToScreenReader('Dashboard refreshed successfully', 'polite');
    } catch (error) {
      announceToScreenReader('Failed to refresh dashboard', 'assertive');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  // Memoized metrics data
  const metricsData = useMemo(() => {
    if (!teamMetrics || !teamStatusCounts) return null;
    
    return [
      {
        title: "Total Clients",
        value: teamStatusCounts.total || 0,
        change: "+12% from last month",
        icon: Users,
        variant: 'default' as const
      },
      {
        title: "Health Score",
        value: `${Math.round(teamMetrics.averageHealth || 0)}%`,
        change: "+5% from last month",
        icon: Heart,
        variant: 'success' as const
      },
      {
        title: "Total MRR",
        value: `$${(teamMetrics.totalMRR || 0).toLocaleString()}`,
        change: "+18% from last month",
        icon: DollarSign,
        variant: 'default' as const
      },
      {
        title: "NPS Score",
        value: (teamMetrics.averageHealth || 0).toFixed(1),
        change: "+0.3 from last month",
        icon: Target,
        variant: 'default' as const
      }
    ];
  }, [teamMetrics, teamStatusCounts]);

  // Show error state
  if (error) {
    return (
      <DashboardErrorFallback 
        error={error} 
        resetErrorBoundary={() => window.location.reload()} 
      />
    );
  }

  // Show empty state if no data
  if (!isLoading && (!allClients || allClients.length === 0)) {
    return <DashboardEmptyState />;
  }

  return (
    <UniversalErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <SidebarProvider>
          <div className="flex w-full">
            <DashboardSidebar />
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {/* Header */}
              <header 
                className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10"
                role="banner"
              >
                <div className="flex h-16 items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <Breadcrumbs />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <SearchBar />
                    <NotificationBell />
                    <ThemeToggle />
                  </div>
                </div>
              </header>

              {/* Dashboard Content */}
              <main 
                className="p-6 space-y-6" 
                role="main"
                id="dashboard-main"
                aria-label="Dashboard overview"
              >
                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    aria-label={isRefreshing ? 'Refreshing data' : 'Refresh dashboard data'}
                  >
                    <RefreshCw 
                      className={cn("h-4 w-4 mr-2", {
                        "animate-spin": isRefreshing,
                        "transition-transform": reducedMotionConfig.enableAnimation()
                      })}
                      aria-hidden="true"
                    />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>

                {/* Key Metrics */}
                <section aria-labelledby="metrics-heading">
                  <h2 id="metrics-heading" className="sr-only">Key Performance Metrics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <MetricSkeleton key={i} />
                      ))
                    ) : (
                      metricsData?.map((metric, index) => (
                        <AccessibleMetricCard
                          key={metric.title}
                          {...metric}
                          isLoading={isLoading}
                        />
                      ))
                    )}
                  </div>
                </section>

                {/* AI Insights and Quick Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <ErrorBoundary FallbackComponent={DashboardErrorFallback}>
                      <Suspense fallback={<MetricSkeleton />}>
                        <RealTimeAIPanel clients={allClients || []} />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                  
                  {/* Quick Stats */}
                  <section aria-labelledby="status-heading">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle id="status-heading" className="text-lg">Client Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {isLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                              <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Active</span>
                              <span className="font-medium text-success" aria-label={`${teamStatusCounts?.active || 0} active clients`}>
                                {teamStatusCounts?.active || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">At Risk</span>
                              <span className="font-medium text-warning" aria-label={`${teamStatusCounts?.atRisk || 0} at-risk clients`}>
                                {teamStatusCounts?.atRisk || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">New</span>
                              <span className="font-medium text-primary" aria-label={`${teamStatusCounts?.new || 0} new clients`}>
                                {teamStatusCounts?.new || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Churned</span>
                              <span className="font-medium text-destructive" aria-label={`${teamStatusCounts?.churned || 0} churned clients`}>
                                {teamStatusCounts?.churned || 0}
                              </span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </section>
                </div>

                {/* Charts */}
                <section aria-labelledby="charts-heading">
                  <h2 id="charts-heading" className="sr-only">Performance Charts</h2>
                  <ErrorBoundary FallbackComponent={DashboardErrorFallback}>
                    <Suspense fallback={
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MetricSkeleton />
                        <MetricSkeleton />
                      </div>
                    }>
                      <ChartComponents 
                        allClients={allClients || []}
                        teamStatusCounts={teamStatusCounts}
                        isLoading={isLoading}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </section>

                {/* Status Notice */}
                <Card className="bg-muted/50" role="status" aria-live="polite">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-success rounded-full" aria-hidden="true"></div>
                      <span className="text-sm text-muted-foreground">
                        {lastUpdated 
                          ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                          : 'Dashboard loaded successfully'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </UniversalErrorBoundary>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';

export default EnhancedDashboard;