
import { Link, useLocation } from "react-router-dom";
import {
  Home, Users, Settings, HelpCircle, LayoutDashboard,
  Activity, CreditCard, MessageSquare, FileSliders,
  Brain, BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useImmediateNavigation } from "@/hooks/use-immediate-navigation";
import { useFocusManager } from "@/hooks/use-focus-manager";
import { useDoubleActivationPrevention } from "@/hooks/use-double-activation-prevention";
import { useState, useEffect } from "react";

export const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/renewals', label: 'Renewals', icon: Activity },
  { to: '/communications', label: 'Communications', icon: MessageSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/automations', label: 'Automations', icon: FileSliders },
  { to: '/health-score-dashboard', label: 'Health Score', icon: Brain },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/system-audit', label: 'System Audit', icon: Activity },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

interface SidebarNavProps {
  collapsed: boolean;
  closeSidebar: () => void;
}

export function SidebarNav({ collapsed, closeSidebar }: SidebarNavProps) {
  const location = useLocation();
  const activeLinkStyle = "bg-secondary text-secondary-foreground";
  const { navigateImmediately } = useImmediateNavigation();
  const { containerRef } = useFocusManager({ autoFocus: false });
  const { createProtectedHandler } = useDoubleActivationPrevention();

  const handleNavigation = (path: string, event: React.MouseEvent) => {
    // Prevent default link behavior to use immediate navigation
    event.preventDefault();
    
    const success = navigateImmediately(path);
    if (success) {
      closeSidebar();
      console.log(`⚡ [SidebarNav] Immediate navigation to: ${path}`, {
        timestamp: Date.now(),
        currentPath: location.pathname
      });
    }
  };

  return (
    <nav 
      className="flex-1 space-y-1" 
      role="navigation" 
      aria-label="Main navigation"
      ref={containerRef}
    >
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        const protectedHandler = createProtectedHandler(
          `nav-${link.to}`,
          (e) => handleNavigation(link.to, e)
        );

        return (
          <Link 
            to={link.to} 
            onClick={protectedHandler}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                protectedHandler(e as any);
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "hover:bg-secondary hover:text-foreground",
              isActive ? activeLinkStyle : "text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
            key={link.to}
            data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            aria-label={`Navigate to ${link.label}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
