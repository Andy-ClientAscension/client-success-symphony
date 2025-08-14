import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { RealTimeAIPanel } from './RealTimeAI/RealTimeAIPanel';
import { Users, Heart, DollarSign, TrendingUp, Target } from 'lucide-react';
import { SearchBar } from '@/components/Navigation/SearchBar';
import { NotificationBell } from '@/components/Navigation/NotificationBell';
import { Breadcrumbs } from '@/components/Navigation/Breadcrumbs';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { AdvancedFilters, useAdvancedFilters } from '@/components/Filters/AdvancedFilters';
import { DashboardCustomizer, useDashboardCustomization, DashboardWidget } from './DashboardCustomizer';
import UniversalErrorBoundary from '@/components/ErrorBoundary/UniversalErrorBoundary';
import { OfflineSupport } from '@/components/OfflineSupport/OfflineSupport';
import { useOptimizedAnalytics } from '@/hooks/useOptimizedAnalytics';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import { LoadingStabilizer } from '@/components/ui/loading-stabilizer';
import { SkeletonCard } from '@/components/ui/skeleton-enhanced';
import { createTestNotifications } from '@/utils/testNotifications';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';

// Memoized components for better performance
const MetricCard = React.memo(({ title, value, change, icon: Icon, colorClass }: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  colorClass: string;
}) => (
  <Card className="card-metric hover-lift">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {change}
          </p>
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
));

const MetricsGrid = React.memo(({ metrics, hasActiveFilters }: {
  metrics: any;
  hasActiveFilters: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
    <MetricCard
      title="Total Students"
      value={metrics.total}
      change={hasActiveFilters ? 'Filtered view' : '+12% from last month'}
      icon={Users}
      colorClass="bg-blue-100 dark:bg-blue-900/20 text-blue-600"
    />
    <MetricCard
      title="Active Students"
      value={metrics.active}
      change={hasActiveFilters ? 'Filtered view' : '+5% from last month'}
      icon={Heart}
      colorClass="bg-green-100 dark:bg-green-900/20 text-green-600"
    />
    <MetricCard
      title="Monthly MRR"
      value={`$${Math.round(metrics.totalMRR / 1000)}K`}
      change={hasActiveFilters ? 'Filtered view' : '+8.2% from last month'}
      icon={DollarSign}
      colorClass="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600"
    />
    <MetricCard
      title="Avg Health Score"
      value={metrics.avgHealth.toFixed(1)}
      change={hasActiveFilters ? 'Filtered view' : '+0.3 from last month'}
      icon={Target}
      colorClass="bg-purple-100 dark:bg-purple-900/20 text-purple-600"
    />
  </div>
));

// Chart components with lazy loading
const ChartCard = React.memo(({ title, children, className }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn("card-elevated", className)}>
    <CardHeader className="pb-1">
      <CardTitle className="text-sm flex items-center gap-2">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      {children}
    </CardContent>
  </Card>
));

// Define default widgets
const defaultWidgets: DashboardWidget[] = [
  { id: 'metrics', title: 'Key Metrics', component: () => null, isVisible: true, size: 'full', order: 0, category: 'metrics' },
  { id: 'revenue-chart', title: 'Revenue Growth', component: () => null, isVisible: true, size: 'medium', order: 1, category: 'charts' },
  { id: 'health-chart', title: 'Health Distribution', component: () => null, isVisible: true, size: 'medium', order: 2, category: 'charts' },
];

export function OptimizedCleanDashboard() {
  // Optimized hooks
  const { allClients, teamStatusCounts, teamMetrics, churnData, npsScore, isLoading, error, lastUpdated, refreshData, isRefreshing } = 
    useOptimizedDashboardData({ enableAutoSync: true, priority: 'high' });
  
  const { trackFeatureUsage, trackClick, trackError } = useOptimizedAnalytics();
  
  // State management
  const { filters, updateFilters, hasActiveFilters } = useAdvancedFilters();
  const { widgets, layout, updateWidgets, updateLayout } = useDashboardCustomization(defaultWidgets);
  
  // Track dashboard usage only once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      trackFeatureUsage('dashboard', 'view', { 
        hasFilters: hasActiveFilters,
        visibleWidgets: widgets.filter(w => w.isVisible).length
      });
    }, 1000); // Delay to avoid immediate tracking
    
    return () => clearTimeout(timer);
  }, []); // Empty deps to track only once

  // Optimized filtered data calculation
  const filteredData = useMemo(() => {
    let filtered = allClients;
    
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(client => filters.statuses.includes(client.status));
    }
    
    if (filters.teams.length > 0) {
      filtered = filtered.filter(client => client.team && filters.teams.includes(client.team));
    }
    
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(client => {
        const clientDate = new Date(client.startDate);
        if (filters.dateRange.from && clientDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && clientDate > filters.dateRange.to) return false;
        return true;
      });
    }
    
    return filtered;
  }, [allClients, filters]);
  
  // Optimized metrics calculation
  const filteredMetrics = useMemo(() => {
    const total = filteredData.length;
    const active = filteredData.filter(c => c.status === 'active').length;
    const atRisk = filteredData.filter(c => c.status === 'at-risk').length;
    const churned = filteredData.filter(c => c.status === 'churned').length;
    const totalMRR = filteredData.reduce((sum, client) => sum + (client.mrr || 0), 0);
    const avgHealth = total > 0 ? filteredData.reduce((sum, client) => sum + (client.npsScore || 0), 0) / total : 0;
    
    return { total, active, atRisk, churned, totalMRR, avgHealth };
  }, [filteredData]);

  // Chart data generation
  const chartData = useMemo(() => {
    const currentMRR = filteredMetrics.totalMRR || 0;
    const studentCount = filteredMetrics.total || 0;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseGrowth = 0.08;
    
    const growthData = months.map((month, index) => {
      const growthFactor = Math.pow(1 + baseGrowth, index - 5);
      return {
        month,
        mrr: Math.round(currentMRR * growthFactor),
        students: Math.max(1, Math.round(studentCount * growthFactor))
      };
    });
    
    const totalClients = Math.max(1, studentCount);
    const healthData = [
      { 
        name: 'Excellent (8-10)', 
        value: Math.round(((filteredMetrics.active || 0) / totalClients) * 100), 
        color: '#22c55e' 
      },
      { 
        name: 'Good (5-7)', 
        value: Math.round(((filteredMetrics.total - filteredMetrics.active - filteredMetrics.atRisk - filteredMetrics.churned || 0) / totalClients) * 100), 
        color: '#f59e0b' 
      },
      { 
        name: 'At Risk (1-4)', 
        value: Math.round(((filteredMetrics.atRisk || 0) / totalClients) * 100), 
        color: '#ef4444' 
      },
    ];
    
    return { growthData, healthData };
  }, [filteredMetrics]);

  // Create test notifications only once
  useEffect(() => {
    const hasCreatedTestNotifications = localStorage.getItem('test-notifications-created');
    if (!hasCreatedTestNotifications) {
      createTestNotifications();
      localStorage.setItem('test-notifications-created', 'true');
    }
  }, []);

  // Error tracking
  useEffect(() => {
    if (error) {
      trackError(error, 'dashboard', { 
        hasFilters: hasActiveFilters,
        dataLength: allClients.length 
      });
    }
  }, [error, trackError, hasActiveFilters, allClients.length]);

  // Available options for filters
  const availableTeams = useMemo(() => 
    Array.from(new Set(allClients.map(client => client.team).filter(Boolean))) as string[], 
    [allClients]
  );
  
  const availableStatuses = useMemo(() => 
    Array.from(new Set(allClients.map(client => client.status))) as string[], 
    [allClients]
  );

  // Event handlers
  const handleRefresh = useCallback(() => {
    trackClick('refresh_button', { context: 'dashboard_header' });
    refreshData();
  }, [trackClick, refreshData]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    trackFeatureUsage('filters', 'change', { 
      filterCount: Object.keys(newFilters).length,
      hasDateRange: !!(newFilters.dateRange?.from || newFilters.dateRange?.to),
      hasTeams: newFilters.teams?.length > 0,
      hasStatuses: newFilters.statuses?.length > 0
    });
    updateFilters(newFilters);
  }, [trackFeatureUsage, updateFilters]);

  // Visible widgets
  const visibleWidgets = widgets.filter(widget => widget.isVisible).sort((a, b) => a.order - b.order);

  // Loading skeleton
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-destructive text-lg">⚠️ Dashboard Error</div>
              <p className="text-muted-foreground">{error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <UniversalErrorBoundary level="page">
      <OfflineSupport>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <DashboardSidebar />
            
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Header */}
              <header className="bg-card border-b border-border shrink-0">
                <div className="flex h-16 items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">CA</span>
                      </div>
                      <h1 className="text-xl font-bold text-foreground">Client Ascension</h1>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <SearchBar className="w-64" />
                    <NotificationBell />
                    <ThemeToggle />
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">JD</span>
                    </div>
                  </div>
                </div>
                
                {/* Breadcrumbs and Controls */}
                <div className="px-6 py-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Breadcrumbs />
                    <div className="flex items-center gap-3">
                      <SyncIndicator
                        isLoading={isLoading}
                        isRefreshing={isRefreshing}
                        lastUpdated={lastUpdated}
                        onRefresh={handleRefresh}
                        syncStatus={error ? 'error' : 'idle'}
                      />
                      <AdvancedFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        availableTeams={availableTeams}
                        availableStatuses={availableStatuses}
                      />
                      <DashboardCustomizer
                        widgets={widgets}
                        onWidgetsChange={updateWidgets}
                        currentLayout={layout}
                        onLayoutChange={updateLayout}
                      />
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 p-4 overflow-auto space-y-4">
                {/* Real-Time AI Panel */}
                <RealTimeAIPanel clients={filteredData} />
                
                {/* Filter Summary */}
                {hasActiveFilters && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Showing {filteredData.length} of {allClients.length} clients with applied filters
                    </p>
                  </div>
                )}
                
                {/* Metrics */}
                <LoadingStabilizer isLoading={isRefreshing} minLoadingTime={300}>
                  <MetricsGrid metrics={filteredMetrics} hasActiveFilters={hasActiveFilters} />
                </LoadingStabilizer>
                
                {/* Charts */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <UniversalErrorBoundary level="component">
                    <ChartCard title="Revenue Growth">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData.growthData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="mrr" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </UniversalErrorBoundary>
                  
                  <UniversalErrorBoundary level="component">
                    <ChartCard title="Health Distribution">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={chartData.healthData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.healthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </UniversalErrorBoundary>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </OfflineSupport>
    </UniversalErrorBoundary>
  );
}