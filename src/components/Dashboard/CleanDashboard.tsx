import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { Users, Heart, DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';
import { FilterState } from '@/components/Filters/AdvancedFilters';
import { SearchBar } from '@/components/Navigation/SearchBar';
import { NotificationBell } from '@/components/Navigation/NotificationBell';
import { Breadcrumbs } from '@/components/Navigation/Breadcrumbs';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { AdvancedFilters, useAdvancedFilters } from '@/components/Filters/AdvancedFilters';
import { DashboardCustomizer, useDashboardCustomization, DashboardWidget } from './DashboardCustomizer';
import UniversalErrorBoundary, { withErrorBoundary } from '@/components/ErrorBoundary/UniversalErrorBoundary';
import { OfflineSupport } from '@/components/OfflineSupport/OfflineSupport';
import { useAnalytics, usePerformanceTracking } from '@/services/analytics';
import { createTestNotifications } from '@/utils/testNotifications';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ContractNotifications } from '@/components/ContractNotifications';
import { ContractNotificationsTrigger } from './ContractNotificationsTrigger';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';

// Define dashboard widgets for customization
const defaultWidgets: DashboardWidget[] = [
  { id: 'metrics', title: 'Key Metrics', component: () => null, isVisible: true, size: 'full', order: 0, category: 'metrics' },
  { id: 'revenue-chart', title: 'Revenue Growth', component: () => null, isVisible: true, size: 'medium', order: 1, category: 'charts' },
  { id: 'health-chart', title: 'Health Distribution', component: () => null, isVisible: true, size: 'medium', order: 2, category: 'charts' },
  { id: 'offers-chart', title: 'Offer Performance', component: () => null, isVisible: true, size: 'medium', order: 3, category: 'charts' },
  { id: 'renewals-chart', title: 'Renewal Forecast', component: () => null, isVisible: true, size: 'medium', order: 4, category: 'charts' }
];

export function CleanDashboard() {
  const { allClients, teamStatusCounts, teamMetrics, churnData, npsScore, isLoading, error, lastUpdated, refreshData, isRefreshing } = useDashboardData({ enableAutoSync: true });
  
  // Analytics and performance tracking
  const { trackFeatureUsage, trackClick, trackError } = useAnalytics();
  usePerformanceTracking();
  
  // Track dashboard usage
  useEffect(() => {
    trackFeatureUsage('dashboard', 'view', { 
      hasFilters: hasActiveFilters,
      visibleWidgets: visibleWidgets.length 
    });
  }, [trackFeatureUsage]);
  
  // Advanced filtering
  const { filters, updateFilters, hasActiveFilters } = useAdvancedFilters();
  
  // Dashboard customization
  const { widgets, layout, updateWidgets, updateLayout } = useDashboardCustomization(defaultWidgets);
  
  // Apply filters to data
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
  
  // Calculate metrics from filtered data
  const filteredMetrics = useMemo(() => {
    const total = filteredData.length;
    const active = filteredData.filter(c => c.status === 'active').length;
    const atRisk = filteredData.filter(c => c.status === 'at-risk').length;
    const churned = filteredData.filter(c => c.status === 'churned').length;
    const totalMRR = filteredData.reduce((sum, client) => sum + (client.mrr || 0), 0);
    const avgHealth = total > 0 ? filteredData.reduce((sum, client) => sum + (client.npsScore || 0), 0) / total : 0;
    
    return { total, active, atRisk, churned, totalMRR, avgHealth };
  }, [filteredData]);
  
  // Create test notifications on first load (for demo purposes)
  useEffect(() => {
    const hasCreatedTestNotifications = localStorage.getItem('test-notifications-created');
    if (!hasCreatedTestNotifications) {
      createTestNotifications();
      localStorage.setItem('test-notifications-created', 'true');
    }
  }, []);
  
  // Generate dynamic chart data from filtered metrics
  const chartData = useMemo(() => {
    const currentMRR = filteredMetrics.totalMRR || 0;
    const studentCount = filteredMetrics.total || 0;
    
    // Generate monthly progression data (mock progression for now, can be enhanced with historical data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseGrowth = 0.08; // 8% monthly growth rate
    
    const growthData = months.map((month, index) => {
      const growthFactor = Math.pow(1 + baseGrowth, index - 5); // Work backwards from current
      return {
        month,
        mrr: Math.round(currentMRR * growthFactor),
        students: Math.max(1, Math.round(studentCount * growthFactor))
      };
    });
    
    // Health distribution based on filtered client data
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
  
  // Layout styles
  const layoutStyles = {
    compact: "space-y-2",
    comfortable: "space-y-4", 
    spacious: "space-y-6"
  };
  
  // Get available teams and statuses for filters
  const availableTeams = useMemo(() => {
    return Array.from(new Set(allClients.map(client => client.team).filter(Boolean)));
  }, [allClients]);
  
  const availableStatuses = useMemo(() => {
    return Array.from(new Set(allClients.map(client => client.status)));
  }, [allClients]);
  
  // Track errors in analytics
  useEffect(() => {
    if (error) {
      trackError(error, 'dashboard', { 
        hasFilters: hasActiveFilters,
        dataLength: allClients.length 
      });
    }
  }, [error, trackError, hasActiveFilters, allClients.length]);
  
  // Visible widgets sorted by order
  const visibleWidgets = widgets.filter(widget => widget.isVisible).sort((a, b) => a.order - b.order);
  
  // Enhanced refresh function with analytics
  const handleRefresh = () => {
    trackClick('refresh_button', { context: 'dashboard_header' });
    refreshData();
  };
  
  // Enhanced filter function with analytics
  const handleFiltersChange = (newFilters: FilterState) => {
    trackFeatureUsage('filters', 'change', { 
      filterCount: Object.keys(newFilters).length,
      hasDateRange: !!(newFilters.dateRange?.from || newFilters.dateRange?.to),
      hasTeams: newFilters.teams?.length > 0,
      hasStatuses: newFilters.statuses?.length > 0
    });
    updateFilters(newFilters);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
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
              <div className="text-red-500 text-lg">⚠️ Dashboard Error</div>
              <p className="text-muted-foreground">{error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
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
          {/* Client Ascension Header */}
          <header className="bg-card border-b border-border shrink-0 sticky top-0 z-20">
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
            
            {/* Breadcrumbs and Filters */}
            <div className="px-6 py-3 border-t border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Breadcrumbs />
                
                <div className="flex flex-wrap items-center gap-3">
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
          <main className={cn("flex-1 p-6 overflow-y-auto min-h-0", layoutStyles[layout as keyof typeof layoutStyles])}>
            {/* Show filter summary */}
            {hasActiveFilters && (
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Showing {filteredData.length} of {allClients.length} clients with applied filters
                </p>
              </div>
            )}
            
            {/* Render widgets based on customization */}
            <UniversalErrorBoundary level="component">
              {visibleWidgets.map((widget) => {
                if (widget.id === 'metrics') {
                return (
                  <div key={widget.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card className="card-metric hover-lift min-h-[120px]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold text-foreground">{filteredMetrics.total}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {hasActiveFilters ? 'Filtered view' : '+12% from last month'}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-metric hover-lift min-h-[120px]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                            <p className="text-2xl font-bold text-foreground">{filteredMetrics.active}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {hasActiveFilters ? 'Filtered view' : '+5% from last month'}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-metric hover-lift min-h-[120px]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Monthly MRR</p>
                            <p className="text-2xl font-bold text-foreground">${Math.round(filteredMetrics.totalMRR / 1000)}K</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {hasActiveFilters ? 'Filtered view' : '+8.2% from last month'}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-metric hover-lift min-h-[120px]">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between h-full">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                            <p className="text-2xl font-bold text-foreground">{filteredMetrics.avgHealth.toFixed(1)}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {hasActiveFilters ? 'Filtered view' : '+0.3 from last month'}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <Target className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
                }
                
                // Continue with other widgets...
                return null;
              })}
            </UniversalErrorBoundary>
            
            {/* Charts Grid - Only show visible chart widgets */}
            <div className={cn(
              "grid gap-6",
              layout === 'compact' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2",
              layout === 'spacious' && "md:grid-cols-1"
            )}>

            <UniversalErrorBoundary level="component">
              {/* Revenue Growth Chart - Only if visible */}
              {visibleWidgets.find(w => w.id === 'revenue-chart')?.isVisible && (
                <Card className="card-elevated">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      Revenue Growth {hasActiveFilters && '(Filtered)'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ResponsiveContainer width="100%" height={layout === 'compact' ? 120 : layout === 'spacious' ? 200 : 150}>
                      <AreaChart data={chartData.growthData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                          fontSize={10}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          className="text-xs text-muted-foreground"
                          tickFormatter={(value) => `$${value/1000}k`}
                          fontSize={10}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'mrr' ? `$${value.toLocaleString()}` : value,
                            name === 'mrr' ? 'MRR' : 'Students'
                          ]}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="mrr" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Student Health Distribution - Only if visible */}
              {visibleWidgets.find(w => w.id === 'health-chart')?.isVisible && (
                <Card className="card-elevated">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Student Health Distribution {hasActiveFilters && '(Filtered)'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ResponsiveContainer width="100%" height={layout === 'compact' ? 120 : layout === 'spacious' ? 200 : 150}>
                      <PieChart>
                        <Pie
                          data={chartData.healthData}
                          cx="50%"
                          cy="50%"
                          innerRadius={15}
                          outerRadius={layout === 'spacious' ? 40 : 25}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.healthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {chartData.healthData.map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <div 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs font-medium">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </UniversalErrorBoundary>
            </div>

            {/* Contract Notifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <div className="lg:col-span-2">
                <ContractNotifications />
              </div>
              <div>
                <ContractNotificationsTrigger />
              </div>
            </div>
          </main>
        </div>
        </div>
      </SidebarProvider>
      </OfflineSupport>
    </UniversalErrorBoundary>
  );
}