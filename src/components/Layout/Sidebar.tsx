
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const location = useLocation();

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
          "bg-black fixed h-full w-64 flex flex-col text-white transition-all duration-300 ease-in-out z-40",
          isOpen ? "left-0" : "-left-64",
          isMobile ? "shadow-xl" : ""
        )}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-red-600" />
            <span className="whitespace-nowrap">Client Symphony</span>
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
        
        <nav className="flex-1 px-2 sm:px-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-800 rounded-md transition-colors",
                      isActive && "bg-zinc-800 font-medium"
                    )}
                    onClick={isMobile ? () => setIsOpen(false) : undefined}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-red-600")} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2 sm:px-4 py-2">
            <div className="rounded-full bg-zinc-800 h-9 w-9 flex items-center justify-center">
              <span className="text-white font-medium">JD</span>
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-white/70">Administrator</div>
            </div>
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
