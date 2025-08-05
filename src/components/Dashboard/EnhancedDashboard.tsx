import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { MetricsGrid } from './Metrics/MetricsGrid';
import { 
  TrendingUp,
  Menu,
  Search,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import our widgets and data
import { RenewalForecastWidget } from './Widgets/RenewalForecastWidget';
import { TaskManagementWidget } from './Widgets/TaskManagementWidget';
import { CommunicationsTimelineWidget } from './Widgets/CommunicationsTimelineWidget';
import { OfferPerformanceWidget } from './Widgets/OfferPerformanceWidget';
import { useNotifications } from '@/hooks/useNotifications';
import { getDashboardStats } from '@/lib/supabase-queries';
import { getAllClients, getClientsCountByStatus } from '@/lib/data';
import { calculateRates } from '@/utils/analyticsUtils';

export function EnhancedDashboard() {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    recentCommunications: 0,
    upcomingRenewals: 0,
    pendingOffers: 0
  });
  
  const { unreadCount } = useNotifications();

  // Get client data for metrics
  const clients = getAllClients();
  const clientCounts = getClientsCountByStatus();
  const totalClients = Object.values(clientCounts).reduce((a, b) => a + b, 0);
  
  const statusCounts = {
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    churned: clientCounts.churned,
    new: clientCounts.new,
    total: totalClients
  };
  
  const rates = calculateRates(statusCounts);
  
  // Calculate performance metrics
  const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
  const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
  const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
  const averageRevenuePerClient = totalClients > 0 ? totalMRR / totalClients : 0;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Clean Header - More like reference */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="p-2 hover:bg-accent rounded-lg transition-colors" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Business overview and key metrics</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-4">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Main Content - Much more spacious */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-[1600px] mx-auto p-8 space-y-12">
              {/* Page Title Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">
                    Good morning, Admin
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Here's what's happening with your business today.
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-success/5 text-success border-success/20 rounded-full">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  All Systems Operational
                </Badge>
              </div>

              {/* Key Metrics - Larger spacing like reference */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Key Performance Indicators</h3>
                  <Button variant="outline" size="sm">View All Reports</Button>
                </div>
                
                <MetricsGrid
                  totalClients={totalClients}
                  growthRate={12}
                  clientCounts={{
                    active: clientCounts.active,
                    'at-risk': clientCounts["at-risk"],
                    new: clientCounts.new
                  }}
                  percentages={{
                    activeClientsPercentage: (clientCounts.active / totalClients) * 100,
                    atRiskPercentage: (clientCounts["at-risk"] / totalClients) * 100,
                    newPercentage: (clientCounts.new / totalClients) * 100
                  }}
                  successRate={rates.retentionRate}
                  churnRate={rates.churnRate}
                />
              </div>

              {/* Analytics Section - Better spacing */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Business Analytics</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export Data</Button>
                    <Button variant="outline" size="sm">Customize View</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="card-premium">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                      <CardDescription>Monthly recurring revenue and growth trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OfferPerformanceWidget />
                    </CardContent>
                  </Card>
                  
                  <Card className="card-premium">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-lg">Client Management</CardTitle>
                      <CardDescription>Upcoming renewals and client health metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RenewalForecastWidget />
                    </CardContent>
                  </Card>
                  
                  <Card className="card-premium">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-lg">Task Overview</CardTitle>
                      <CardDescription>Pending tasks and team productivity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TaskManagementWidget />
                    </CardContent>
                  </Card>
                  
                  <Card className="card-premium">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-lg">Communications</CardTitle>
                      <CardDescription>Recent client interactions and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CommunicationsTimelineWidget />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}