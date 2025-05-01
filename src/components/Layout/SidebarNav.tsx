
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  BarChart2, 
  Calendar, 
  MessageSquare, 
  Settings,
  HelpCircle
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Renewals",
    href: "/renewals",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Communications",
    href: "/communications",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Help",
    href: "/help",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

export function SidebarNav() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )
          }
        >
          {item.icon}
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
