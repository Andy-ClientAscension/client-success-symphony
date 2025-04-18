
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home, Users, Settings, HelpCircle, LayoutDashboard,
  Activity, CreditCard, MessageSquare, FileSliders,
  Brain, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/renewals', label: 'Renewals', icon: Activity },
  { to: '/communications', label: 'Communications', icon: MessageSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/automations', label: 'Automations', icon: FileSliders },
  { to: '/health-score', label: 'Health Score', icon: Brain },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

interface SidebarNavProps {
  collapsed: boolean;
  closeSidebar: () => void;
}

export function SidebarNav({ collapsed, closeSidebar }: SidebarNavProps) {
  const location = useLocation();
  const activeLinkStyle = "bg-secondary text-secondary-foreground";

  return (
    <div className="flex-1 space-y-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;

        return (
          <Link to={link.to} onClick={closeSidebar} className="w-full" key={link.to}>
            <Button
              variant="ghost"
              className={cn(
                "justify-start px-4 py-2 w-full font-normal",
                isActive ? activeLinkStyle : "hover:bg-secondary",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {!collapsed && <span>{link.label}</span>}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
