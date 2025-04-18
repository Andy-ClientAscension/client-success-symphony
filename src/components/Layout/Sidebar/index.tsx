
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarProfile } from "./SidebarProfile";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
  isMobile: boolean;
  closeSidebar: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isMobile, closeSidebar, collapsed, toggleCollapse }: SidebarProps) {
  const { user, logout: signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const avatarName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User';
  const avatarFallbackInitials = user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}` : 'U';

  const handleSignOut = async () => {
    try {
      signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full w-60 bg-background border-r border-muted/50 dark:border-muted/30">
      <SidebarHeader 
        collapsed={collapsed} 
        isMobile={isMobile} 
        toggleCollapse={toggleCollapse} 
      />
      <SidebarProfile 
        collapsed={collapsed}
        user={user}
        avatarName={avatarName}
        avatarFallbackInitials={avatarFallbackInitials}
      />
      <SidebarNav collapsed={collapsed} closeSidebar={closeSidebar} />
      <SidebarFooter collapsed={collapsed} handleSignOut={handleSignOut} />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen fixed md:relative z-40 transition-transform duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {renderSidebarContent()}
    </aside>
  );
}
