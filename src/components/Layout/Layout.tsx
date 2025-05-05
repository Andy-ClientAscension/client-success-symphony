
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

// Critical CSS to prevent layout shifts during loading
const criticalCSS = `
  .loading-state {
    display: grid;
    place-items: center;
    min-height: 100vh;
    width: 100%;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3182ce;
    animation: spin 1s linear infinite;
  }
  
  .sidebar {
    transition: transform 0.3s ease-in-out;
  }
  
  .sidebar-backdrop {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  .sidebar-visible {
    transform: translateX(0);
  }
  
  .sidebar-hidden {
    transform: translateX(-100%);
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .dark .loading-spinner {
    border-top-color: #90cdf4;
  }
`;

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
    <>
      {/* Inline critical CSS */}
      <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      
      <div 
        className="flex h-screen w-full bg-gradient-to-br from-background to-background/95 overflow-hidden" 
        role="application"
        aria-label="Dashboard Layout"
      >
        <nav 
          className={cn(
            "fixed md:relative h-full z-40 transition-transform duration-300 ease-in-out sidebar",
            isMobile ? 
              (sidebarOpen ? "sidebar-visible" : "sidebar-hidden") :
              (sidebarOpen ? "sidebar-visible" : "sidebar-hidden md:sidebar-visible")
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
            className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out sidebar-backdrop"
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
    </>
  );
}
