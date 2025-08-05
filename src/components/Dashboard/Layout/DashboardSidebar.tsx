import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Clients', url: '/clients', icon: Users },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Performance', url: '/performance', icon: TrendingUp },
];

const managementItems = [
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Communications', url: '/communications', icon: MessageSquare },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Goals', url: '/goals', icon: Target },
];

const systemItems = [
  { title: 'Notifications', url: '/notifications', icon: Bell },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = (itemUrl: string) => {
    const active = isActive(itemUrl);
    return cn(
      'flex items-center w-full px-6 py-4 rounded-2xl transition-all duration-200 group relative text-left',
      active 
        ? 'bg-primary text-primary-foreground shadow-lg font-semibold' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
    );
  };

  const renderNavGroup = (
    items: typeof mainNavItems,
    groupLabel: string
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-bold uppercase tracking-wide text-muted-foreground px-10 mb-6">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-3 px-8">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-14">
                <NavLink
                  to={item.url}
                  end
                  className={getNavClasses(item.url)}
                >
                  <item.icon className="h-6 w-6 transition-colors mr-5" />
                  <span className="text-base font-medium">
                    {item.title}
                  </span>
                  {isActive(item.url) && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r bg-background w-80 min-w-80">
      <SidebarContent className="py-10">
        {/* Brand Section - Much more spacious */}
        <div className="px-10 mb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">Client Ascension</h2>
            <p className="text-base text-muted-foreground">Business Intelligence Platform</p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Main Navigation */}
          {renderNavGroup(mainNavItems, 'Dashboard')}
          
          {/* Management */}
          {renderNavGroup(managementItems, 'Management')}
          
          {/* System */}
          {renderNavGroup(systemItems, 'Settings')}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}