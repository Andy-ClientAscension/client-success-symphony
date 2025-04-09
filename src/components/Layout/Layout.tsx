
import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Close sidebar by default on mobile and when screen size changes to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
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
  
  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {sidebarOpen && (
        <div className={`${isMobile ? 'fixed inset-0 z-40 bg-black bg-opacity-50' : ''}`} onClick={isMobile ? closeSidebar : undefined}>
          <div className={`${isMobile ? 'w-[280px] relative z-50' : ''}`} onClick={e => e.stopPropagation()}>
            <Sidebar isMobile={isMobile} closeSidebar={closeSidebar} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 w-full overflow-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
