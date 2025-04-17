import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Users,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Activity,
  CreditCard,
  MessageSquare,
  FileSliders,
  Brain,
  Building2,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronsLeft
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobile: boolean;
  closeSidebar: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isMobile, closeSidebar, collapsed, toggleCollapse }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const avatarName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'User';
  const avatarFallbackInitials = user?.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}` : 'U';

  const handleSignOut = async () => {
    try {
      await signOut();
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

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/renewals', label: 'Renewals', icon: Activity },
    { to: '/communications', label: 'Communications', icon: MessageSquare },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/automations', label: 'Automations', icon: FileSliders },
    { to: '/health-score', label: 'Health Score', icon: Brain },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help', icon: HelpCircle },
  ];

  const activeLinkStyle = "bg-secondary text-secondary-foreground";

  const renderNavLink = (link: { to: string; label: string; icon: React.ComponentType }) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.to;

    return (
      <Link to={link.to} onClick={closeSidebar} className="w-full">
        <Button
          variant="ghost"
          className={cn(
            "justify-start px-4 py-2 w-full font-normal",
            isActive ? activeLinkStyle : "hover:bg-secondary",
            collapsed && "justify-center"
          )}
        >
          <Icon className="h-4 w-4 mr-2" />
          {!collapsed && <span>{link.label}</span>}
        </Button>
      </Link>
    );
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
            <AvatarImage src={user?.image} alt={avatarName} />
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
      <div className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <React.Fragment key={link.to}>
            {renderNavLink(link)}
          </React.Fragment>
        ))}
      </div>
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
