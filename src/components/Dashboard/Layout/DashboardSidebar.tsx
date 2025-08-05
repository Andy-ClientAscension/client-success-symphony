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
      'flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors',
      active 
        ? 'bg-red-50 text-red-600 font-medium' 
        : 'text-gray-700 hover:bg-gray-50'
    );
  };

  const renderNavGroup = (
    items: typeof mainNavItems,
    groupLabel: string
  ) => (
    <SidebarGroup>
      {groupLabel && (
        <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-2 mb-2">
          {groupLabel}
        </SidebarGroupLabel>
      )}
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
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="bg-white border-r border-gray-200 w-64">
      <SidebarContent className="py-6">
        {/* Brand Section */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">CA</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Client Ascension</h2>
              <p className="text-xs text-gray-500">Events</p>
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