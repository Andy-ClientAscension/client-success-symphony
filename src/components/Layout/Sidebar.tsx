
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart2, 
  Calendar, 
  MessagesSquare, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const location = useLocation();
  const { logout, user } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clients", href: "/add-client" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Calendar, label: "Renewals", href: "/renewals" },
    { icon: MessagesSquare, label: "Communications", href: "/communications" },
    { icon: CreditCard, label: "Payments", href: "/payments" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help", href: "/help" }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 shadow-md"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      )}
      
      <div
        className={cn(
          "bg-black fixed h-full w-56 flex flex-col text-white z-40",
          isOpen ? "left-0" : "-left-56",
          isMobile ? "shadow-xl" : ""
        )}
      >
        <div className="p-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-red-600" />
            <span className="whitespace-nowrap">SSC Dashboard</span>
          </h1>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={toggleSidebar}
            >
              <X size={20} />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 px-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-white hover:bg-zinc-800 rounded-md transition-colors",
                      isActive && "bg-zinc-800 font-medium"
                    )}
                    onClick={isMobile ? () => setIsOpen(false) : undefined}
                  >
                    <item.icon className={cn("h-4 w-4", isActive && "text-red-600")} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="rounded-full bg-zinc-800 h-7 w-7 flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium truncate">{user?.email || "User"}</div>
              <div className="text-xs text-white/70">Administrator</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-red-600/20 h-7 w-7"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" 
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
