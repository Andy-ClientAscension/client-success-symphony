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
import UniversalErrorBoundary from '@/components/ErrorBoundary/UniversalErrorBoundary';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils';

// Guaranteed fallback data that always renders
const DASHBOARD_DATA = {
  allClients: [
    {
      id: 'demo-1',
      name: 'Acme Corporation',
      status: 'active',
      mrr: 5000,
      npsScore: 8.5,
      lastContact: '2024-01-15',
      progress: 85,
      created_at: '2024-01-01'
    },
    {
      id: 'demo-2', 
      name: 'Tech Solutions Inc',
      status: 'at-risk',
      mrr: 2500,
      npsScore: 6.2,
      lastContact: '2024-01-10',
      progress: 45,
      created_at: '2024-01-05'
    },
    {
      id: 'demo-3',
      name: 'Global Enterprises',
      status: 'active',
      mrr: 8000,
      npsScore: 9.1,
      lastContact: '2024-01-14',
      progress: 92,
      created_at: '2024-01-03'
    }
  ],
  metrics: {
    totalClients: 3,
    totalMRR: 15500,
    avgHealthScore: 74,
    avgNPS: 7.9
  },
  statusCounts: {
    active: 2,
    'at-risk': 1,
    new: 0,
    churned: 0
  },
  chartData: [
    { month: 'Jan', churn: 5, retention: 95 },
    { month: 'Feb', churn: 7, retention: 93 },
    { month: 'Mar', churn: 6, retention: 94 },
    { month: 'Apr', churn: 8, retention: 92 },
    { month: 'May', churn: 9, retention: 91 },
    { month: 'Jun', churn: 8, retention: 92 }
  ]
};

// Memoized metric card component
const MetricCard = React.memo(({ title, value, change, icon: Icon, colorClass }: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  colorClass: string;
}) => (
  <Card className="hover:shadow-md transition-shadow">
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

const OptimizedCleanDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart data for pie chart
  const pieData = useMemo(() => [
    { name: 'Active', value: DASHBOARD_DATA.statusCounts.active, color: 'hsl(var(--chart-1))' },
    { name: 'At Risk', value: DASHBOARD_DATA.statusCounts['at-risk'], color: 'hsl(var(--chart-2))' },
    { name: 'New', value: DASHBOARD_DATA.statusCounts.new, color: 'hsl(var(--chart-3))' },
    { name: 'Churned', value: DASHBOARD_DATA.statusCounts.churned, color: 'hsl(var(--chart-4))' }
  ].filter(item => item.value > 0), []);

  // Handle refresh action
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  return (
    <UniversalErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <SidebarProvider>
          <div className="flex w-full">
            <DashboardSidebar />
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              {/* Header */}
              <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
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
              <main className="p-6 space-y-6">
                {/* Controls */}
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Clients"
                    value={DASHBOARD_DATA.metrics.totalClients}
                    change="+12% from last month"
                    icon={Users}
                    colorClass="bg-primary/10 text-primary"
                  />
                  <MetricCard
                    title="Health Score"
                    value={`${DASHBOARD_DATA.metrics.avgHealthScore}%`}
                    change="+5% from last month"
                    icon={Heart}
                    colorClass="bg-green-500/10 text-green-600"
                  />
                  <MetricCard
                    title="Total MRR"
                    value={`$${DASHBOARD_DATA.metrics.totalMRR.toLocaleString()}`}
                    change="+18% from last month"
                    icon={DollarSign}
                    colorClass="bg-blue-500/10 text-blue-600"
                  />
                  <MetricCard
                    title="NPS Score"
                    value={DASHBOARD_DATA.metrics.avgNPS}
                    change="+0.3 from last month"
                    icon={Target}
                    colorClass="bg-purple-500/10 text-purple-600"
                  />
                </div>

                {/* AI Insights and Quick Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <RealTimeAIPanel clients={DASHBOARD_DATA.allClients as any} />
                  </div>
                  
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Client Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <span className="font-medium text-green-600">{DASHBOARD_DATA.statusCounts.active}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">At Risk</span>
                        <span className="font-medium text-orange-600">{DASHBOARD_DATA.statusCounts['at-risk']}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">New</span>
                        <span className="font-medium text-blue-600">{DASHBOARD_DATA.statusCounts.new}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Churned</span>
                        <span className="font-medium text-red-600">{DASHBOARD_DATA.statusCounts.churned}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Churn Trend Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Churn Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={DASHBOARD_DATA.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="churn" 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={2}
                            name="Churn Rate"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="retention" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Retention Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Status Distribution */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Client Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Notice */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        Dashboard loaded with sample data. Real-time updates available when connected to live data source.
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
};

export default OptimizedCleanDashboard;