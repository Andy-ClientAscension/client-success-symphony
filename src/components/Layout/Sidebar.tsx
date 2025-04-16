import {
  LayoutDashboard,
  Users,
  BarChart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  LogOut,
  Zap,
  Bot
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isMobile: boolean;
  closeSidebar: () => void;
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

export function Sidebar({ isMobile, closeSidebar, collapsed = false, toggleCollapse }: SidebarProps) {
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();
  const { logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      color: "border-green-400" // Active clients color
    },
    {
      name: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
      color: "border-blue-400" // Graduated color
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5" />,
      color: "border-purple-400" // Backend color
    },
    {
      name: "Renewals",
      href: "/renewals",
      icon: <Calendar className="h-5 w-5" />,
      color: "border-indigo-400" // Olympia color
    },
    {
      name: "Communications",
      href: "/communications",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "border-amber-400" // Paused color
    },
    {
      name: "Automations",
      href: "/automations",
      icon: <Zap className="h-5 w-5" />,
      color: "border-purple-400" // Using purple color
    },
    {
      name: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
      color: "border-red-400" // Churned color
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      color: "border-gray-400"
    },
    {
      name: "Help",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "border-gray-400"
    },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border transition-all duration-300 ease-in-out",
      collapsed && !isMobile && "w-20"
    )}>
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
        {isMobile ? (
          <Button variant="ghost" className="p-0 mr-2 text-sidebar-foreground" onClick={closeSidebar} aria-label="Close sidebar">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : null}
        
        <div className={cn("flex items-center gap-2", collapsed && !isMobile && "justify-center w-full")}>
          <div className="w-4 h-6 bg-red-600 shrink-0"></div>
          {(!collapsed || isMobile) && <h1 className="font-bold text-xl text-sidebar-foreground">SSC Dashboard</h1>}
        </div>
        
        {!isMobile && toggleCollapse && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 ml-2 text-sidebar-foreground hover:bg-sidebar-accent" 
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>
      
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) => {
                  return cn(
                    "flex items-center gap-3 rounded-md pl-3 py-2.5 text-base font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-4",
                    isActive 
                      ? `bg-sidebar-accent ${item.color} text-sidebar-accent-foreground` 
                      : "text-sidebar-foreground/80 border-transparent",
                    collapsed && !isMobile && "justify-center pl-0 border-l-0 border-r-4"
                  );
                }}
                onClick={isMobile ? closeSidebar : undefined}
                aria-label={item.name}
              >
                <span className="shrink-0">{item.icon}</span>
                {(!collapsed || isMobile) && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex flex-col gap-3",
          collapsed && !isMobile && "items-center"
        )}>
          <div className={cn(
            "text-xs text-sidebar-foreground/60",
            collapsed && !isMobile && "text-center"
          )}>
            {!collapsed && <span>© 2025 Client Ascension</span>}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full",
              collapsed && !isMobile && "justify-center px-0"
            )}
            aria-label="Logout from dashboard"
          >
            <LogOut className="h-5 w-5" />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
