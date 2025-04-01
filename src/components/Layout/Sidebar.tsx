import {
  Home,
  Users,
  Calendar,
  Settings,
  CreditCard,
  LineChart,
  Bell,
  Heart,
  LayoutDashboard,
  ListChecks
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardPersistence } from "@/hooks/use-dashboard-persistence";

interface SidebarProps {
  isMobile: boolean;
  closeSidebar: () => void;
}

export function Sidebar({ isMobile, closeSidebar }: SidebarProps) {
  const { persistDashboard, togglePersistDashboard } = useDashboardPersistence();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      name: "Health Scores",
      href: "/health-scores",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Button variant="ghost" className="pl-0 lg:hidden" onClick={closeSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Button>
        <h1 className="font-bold text-2xl">CRM Tool</h1>
        <p className="text-sm text-muted-foreground">
          Manage clients & track performance
        </p>
      </div>
      <div className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`
                }
                onClick={isMobile ? closeSidebar : undefined}
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4">
        <div className="border rounded-lg p-3 bg-secondary/50">
          <h3 className="text-sm font-medium">Dashboard Persistence</h3>
          <p className="text-xs text-muted-foreground">
            Save dashboard data between sessions
          </p>
          <Button
            variant="outline"
            className="w-full mt-2 text-xs"
            onClick={togglePersistDashboard}
          >
            {persistDashboard ? "Disable Auto-Save" : "Enable Auto-Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
