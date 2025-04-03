
import {
  LayoutDashboard,
  Users,
  BarChart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare
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
    <div className="flex flex-col h-full bg-black text-white w-64 border-0">
      <div className="px-6 py-6 border-b border-gray-800 flex items-center">
        {isMobile && (
          <Button variant="ghost" className="pl-0 mr-2 lg:hidden text-white" onClick={closeSidebar}>
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
        )}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-6 bg-red-600"></div>
            <h1 className="font-bold text-2xl text-white">SSC Dashboard</h1>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) => {
                  return `flex items-center gap-3 rounded-md pl-3 py-2.5 text-base font-medium transition-colors hover:bg-gray-800 border-l-4 ${
                    isActive 
                      ? `bg-gray-800 ${item.color}` 
                      : "text-gray-300 border-transparent"
                  }`;
                }}
                onClick={isMobile ? closeSidebar : undefined}
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
