
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronsLeft, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/Layout/Sidebar/SidebarNav";  // Updated import path
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  
  // Use the user's name if available (from metadata) or fallback to email
  const avatarName = user?.name || user?.email || 'User';
  // Create initials for the avatar fallback
  const avatarFallbackInitials = avatarName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

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
      <div className="flex items-center justify-between py-3 px-4 h-14 shrink-0">
        <Link to="/" className="flex items-center font-semibold">
          <Building2 className="h-6 w-6 mr-2" />
          {!collapsed && <span className="text-xl">Client360</span>}
        </Link>
        {!isMobile && (
          <Button variant="ghost" size="sm" onClick={toggleCollapse}>
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <Separator />
      <div className="py-4">
        <div className="px-4 pb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage alt={avatarName} />
            <AvatarFallback>{avatarFallbackInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">{avatarName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        <Separator />
      </div>
      <SidebarNav collapsed={collapsed} closeSidebar={closeSidebar} />
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
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
