
import { useState } from "react";
import { Link } from "react-router-dom";
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clients", href: "/clients" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Calendar, label: "Renewals", href: "/renewals" },
    { icon: MessagesSquare, label: "Communications", href: "/communications" },
    { icon: CreditCard, label: "Payments", href: "/payments" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Help", href: "/help" }
  ];

  const renderToggleButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 lg:hidden"
      onClick={toggleSidebar}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  );

  return (
    <>
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      )}
      
      <div
        className={cn(
          "bg-sidebar fixed h-full w-64 flex flex-col text-sidebar-foreground transition-all duration-300 ease-in-out z-40",
          isOpen ? "left-0" : "-left-64"
        )}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-sidebar-primary" />
            <span>Client Symphony</span>
          </h1>
          {isMobile && renderToggleButton()}
        </div>
        
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                  onClick={isMobile ? () => setIsOpen(false) : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="rounded-full bg-sidebar-accent h-9 w-9 flex items-center justify-center">
              <span className="text-sidebar-foreground font-medium">JD</span>
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-sidebar-foreground/70">Administrator</div>
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
