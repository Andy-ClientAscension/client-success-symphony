import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
  FileText,
  Bell,
  Heart,
  CreditCard,
  Zap
} from 'lucide-react';
import { SidebarNavLink } from '@/components/Navigation/StandardNavLink';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', url: '/clients', icon: Users },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Health Scores', url: '/health-score-dashboard', icon: Heart },
];

const managementItems = [
  { title: 'Renewals', url: '/renewals', icon: Calendar },
  { title: 'Communications', url: '/communications', icon: MessageSquare },
  { title: 'Payments', url: '/payments', icon: CreditCard },
  { title: 'Automations', url: '/automations', icon: Zap },
];

const systemItems = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  // Removed getNavClasses - now handled by StandardNavLink

  const renderNavGroup = (
    items: typeof mainNavItems,
    groupLabel: string
  ) => (
    <SidebarGroup>
      {groupLabel && (
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <SidebarNavLink
                  to={item.url}
                  end
                  icon={item.icon}
                >
                  {item.title}
                </SidebarNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="bg-card border-r border-border w-64">
      <SidebarContent className="py-6">
        {/* Client Ascension Brand Section */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CA</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground">Client Ascension</h2>
              <p className="text-xs text-muted-foreground">Student Success Portal</p>
            </div>
          </div>
        </div>

        <div className="space-y-1 px-4">
          {/* Main Navigation */}
          {renderNavGroup(mainNavItems, '')}
          
          {/* Management */}
          {renderNavGroup(managementItems, '')}
          
          {/* System */}
          {renderNavGroup(systemItems, '')}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}