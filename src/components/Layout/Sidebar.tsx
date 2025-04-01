
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Calendar,
  CreditCard,
  Heart,
  Settings,
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
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Health Scores",
      href: "/health-scores",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white w-64">
      <div className="px-6 py-6 border-b border-gray-800">
        <Button variant="ghost" className="pl-0 lg:hidden text-white" onClick={closeSidebar}>
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
        <h1 className="font-bold text-2xl text-white">SSC Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage clients & track performance
        </p>
      </div>
      <div className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-2.5 text-base font-medium transition-colors hover:bg-gray-800 ${
                    isActive ? "bg-gray-800" : "text-gray-300"
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
      <div className="p-4 border-t border-gray-800">
        <div className="rounded-lg p-3 bg-gray-800">
          <h3 className="text-sm font-medium text-gray-200">Dashboard Persistence</h3>
          <p className="text-xs text-gray-400">
            Save dashboard data between sessions
          </p>
          <Button
            variant="outline"
            className="w-full mt-2 text-xs bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={togglePersistDashboard}
          >
            {persistDashboard ? "Disable Auto-Save" : "Enable Auto-Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
