import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './Layout/DashboardSidebar';
import { MetricCard } from './Metrics/MetricCard';
import { 
  TrendingUp,
  Search,
  Settings,
  Users,
  Heart,
  DollarSign
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
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Clean Header - matching reference */}
          <header className="bg-white border-b border-gray-200 h-16">
            <div className="flex h-full items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search here"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm w-64"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </header>

          {/* Main Content - proper spacing like reference */}
          <main className="flex-1 p-6">
            {/* Metrics Cards Row - exactly like reference */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <MetricCard
                title="Total Clients"
                value={totalClients}
                icon={<Users />}
                trend={{ value: 13, direction: 'up', label: 'of target' }}
                variant="primary"
                iconColor="bg-orange-100 text-orange-600"
              />
              <MetricCard
                title="Active Clients"
                value={clientCounts.active}
                icon={<Heart />}
                trend={{ value: 12, direction: 'up', label: 'of target' }}
                variant="success"
                iconColor="bg-purple-100 text-purple-600"
              />
              <MetricCard
                title="Monthly Revenue"
                value={`$${Math.round(totalMRR)}`}
                icon={<DollarSign />}
                trend={{ value: 9, direction: 'down', label: 'of target' }}
                variant="success"
                iconColor="bg-green-100 text-green-600"
              />
              <MetricCard
                title="Deals Closed"
                value={totalDealsClosed}
                icon={<TrendingUp />}
                trend={{ value: 3, direction: 'up', label: 'of target' }}
                variant="warning"
                iconColor="bg-yellow-100 text-yellow-600"
              />
            </div>

            {/* Charts Grid - 2x2 like reference */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200 rounded-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <OfferPerformanceWidget />
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 rounded-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Client Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RenewalForecastWidget />
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 rounded-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Task Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskManagementWidget />
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-gray-200 rounded-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Communications</CardTitle>
                </CardHeader>
                <CardContent>
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