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
      'transition-all duration-200 group relative',
      active 
        ? 'bg-primary text-primary-foreground shadow-sm font-medium' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
    );
  };

  const renderNavGroup = (
    items: typeof mainNavItems,
    groupLabel: string
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className={getNavClasses(item.url)}
                >
                  <item.icon className="h-4 w-4 transition-colors mr-3" />
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                  {isActive(item.url) && (
                    <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-current" />
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
    <Sidebar
      className="border-r bg-card/50 backdrop-blur-sm transition-all duration-300 w-64"
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        {/* Brand Section */}
        <div className="px-6 mb-6">
          <div>
            <h2 className="text-lg font-bold text-primary">Client Ascension</h2>
            <p className="text-xs text-muted-foreground">Business Intelligence</p>
          </div>
        </div>

        {/* Main Navigation */}
        {renderNavGroup(mainNavItems, 'Main')}
        
        {/* Management */}
        {renderNavGroup(managementItems, 'Management')}
        
        {/* System */}
        {renderNavGroup(systemItems, 'System')}
      </SidebarContent>
    </Sidebar>
  );
}