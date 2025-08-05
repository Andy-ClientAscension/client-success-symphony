import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Bell, 
  TrendingUp,
  Calendar,
  MessageSquare,
  CheckSquare,
  DollarSign
} from 'lucide-react';

// Import our new widgets
import { RenewalForecastWidget } from './Widgets/RenewalForecastWidget';
import { TaskManagementWidget } from './Widgets/TaskManagementWidget';
import { CommunicationsTimelineWidget } from './Widgets/CommunicationsTimelineWidget';
import { OfferPerformanceWidget } from './Widgets/OfferPerformanceWidget';
import { UserProfilesTable } from './UserManagement/UserProfilesTable';
import { NotificationCenter } from './Notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { getDashboardStats } from '@/lib/supabase-queries';

export function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    pendingTasks: 0,
    recentCommunications: 0,
    upcomingRenewals: 0,
    pendingOffers: 0
  });
  const { unreadCount } = useNotifications();

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
    <div className="space-y-6 animate-fade-up">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-primary rounded-xl text-white shadow-lg">
        <div>
          <h1 className="text-4xl font-bold mb-2">Client Ascension</h1>
          <p className="text-white/90 text-lg">
            Comprehensive Business Intelligence Dashboard
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
          <TrendingUp className="h-4 w-4" />
          All Systems Active
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards with Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
            <Card className="card-elevated hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-primary">{stats.pendingTasks}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending tasks</p>
              </CardContent>
            </Card>

            <Card className="card-elevated hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-primary">{stats.upcomingRenewals}</div>
                <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
              </CardContent>
            </Card>

            <Card className="card-elevated hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Communications</CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-primary">{stats.recentCommunications}</div>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </CardContent>
            </Card>

            <Card className="card-elevated hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-primary">{stats.pendingOffers}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskManagementWidget />
            <RenewalForecastWidget />
            <CommunicationsTimelineWidget />
            <OfferPerformanceWidget />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OfferPerformanceWidget />
            <RenewalForecastWidget />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserProfilesTable />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}