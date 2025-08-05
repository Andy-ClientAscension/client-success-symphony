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
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Modern Header */}
          <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="p-2 hover:bg-accent rounded-md transition-colors" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Business Intelligence Overview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-8">
            {/* Hero Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                  <p className="text-muted-foreground">
                    Here's what's happening with your business today.
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2 bg-success/10 text-success border-success/20">
                  <TrendingUp className="h-3 w-3" />
                  All Systems Operational
                </Badge>
              </div>
            </div>

            {/* Metrics Grid */}
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

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskManagementWidget />
              <RenewalForecastWidget />
              <CommunicationsTimelineWidget />
              <OfferPerformanceWidget />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}