
import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AIAssistant } from "@/components/Dashboard/AIAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    }
  }, [isMobile]);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div 
      className="flex h-screen w-full bg-gradient-to-br from-background to-background/95 overflow-hidden" 
      role="application"
      aria-label="Dashboard Layout"
    >
      <nav 
        className={cn(
          "fixed md:relative h-full z-40 transition-transform duration-300 ease-in-out",
          isMobile ? 
            (sidebarOpen ? "translate-x-0" : "-translate-x-full") :
            (sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        )}
        role="navigation"
        aria-label="Main Navigation"
      >
        <Sidebar 
          isMobile={isMobile} 
          closeSidebar={closeSidebar} 
          collapsed={!isMobile && sidebarCollapsed} 
          toggleCollapse={toggleSidebarCollapse}
        />
      </nav>
      
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
          role="presentation"
          aria-hidden="true"
        />
      )}
      
      <div className={cn(
        "flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out",
        !isMobile && sidebarOpen && !sidebarCollapsed && "md:ml-0",
        !isMobile && sidebarOpen && sidebarCollapsed && "md:ml-0"
      )}>
        <Header 
          toggleSidebar={toggleSidebar} 
          sidebarVisible={sidebarOpen} 
          sidebarCollapsed={sidebarCollapsed} 
        />
        <main 
          className="flex-1 w-full overflow-auto bg-gradient-to-br from-background to-background/95 rounded-tl-xl" 
          role="main"
          aria-label="Main Content"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <Toaster />
      <AIAssistant />
    </div>
  );
}
