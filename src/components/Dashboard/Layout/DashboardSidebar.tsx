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
      'flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group relative text-left',
      active 
        ? 'bg-primary text-primary-foreground shadow-sm font-medium' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
    );
  };

  const renderNavGroup = (
    items: typeof mainNavItems,
    groupLabel: string
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-8 mb-4">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2 px-6">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-11">
                <NavLink
                  to={item.url}
                  end
                  className={getNavClasses(item.url)}
                >
                  <item.icon className="h-5 w-5 transition-colors mr-4" />
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                  {isActive(item.url) && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
    <Sidebar className="border-r bg-background w-72 min-w-72">
      <SidebarContent className="py-8">
        {/* Brand Section - More spacious */}
        <div className="px-8 mb-10">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary">Client Ascension</h2>
            <p className="text-sm text-muted-foreground">Business Intelligence Platform</p>
          </div>
        </div>

        <div className="space-y-8">
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