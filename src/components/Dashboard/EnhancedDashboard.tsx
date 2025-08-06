import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { MetricCard } from './Metrics/MetricCard';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  TrendingUp,
  Search,
  Settings,
  Users,
  Heart,
  DollarSign,
  Bell
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
        
        <div className="flex-1 flex flex-col">
          {/* Client Ascension Header */}
          <header className="bg-card border-b border-border h-16">
            <div className="flex h-full items-center justify-between px-6">
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search students..."
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <div className="h-8 w-8 rounded-full bg-muted"></div>
              </div>
            </div>
          </header>

          {/* Main Content - better space utilization */}
          <main className="flex-1 p-6 overflow-auto">
            {/* Metrics Cards Row - 3 cards like reference */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <MetricCard
                title="Total Students"
                value="175"
                icon={<Users />}
                trend={{ value: 13, direction: 'up', label: 'of target' }}
                variant="primary"
                iconColor="bg-orange-100 text-orange-600"
              />
              <MetricCard
                title="Active Students"
                value="34"
                icon={<Heart />}
                trend={{ value: 12, direction: 'up', label: 'of target' }}
                variant="success"
                iconColor="bg-purple-100 text-purple-600"
              />
              <MetricCard
                title="Monthly Revenue"
                value="$895507"
                icon={<DollarSign />}
                trend={{ value: 9, direction: 'down', label: 'of target' }}
                variant="warning"
                iconColor="bg-green-100 text-green-600"
              />
            </div>

            {/* Charts Grid - 2x2 filling remaining space */}
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-280px)]">
              <Card className="card-elevated">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg font-semibold">Offer Performance</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500">Track offer success rates and revenue impact</p>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)]">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Revenue Won</p>
                      <p className="text-2xl font-bold text-green-600">$0.00</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                      <p className="text-2xl font-bold text-blue-600">0.0%</p>
                    </div>
                  </div>
                  <OfferPerformanceWidget />
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-semibold">Renewal Forecast</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">Upcoming renewals in the next 30 days</p>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)]">
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">$0.00</p>
                  </div>
                  <RenewalForecastWidget />
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Task Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Current tasks and productivity metrics</p>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)]">
                  <TaskManagementWidget />
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Student Communications</CardTitle>
                  <p className="text-sm text-muted-foreground">Recent interactions and updates</p>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)]">
                  <CommunicationsTimelineWidget />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}