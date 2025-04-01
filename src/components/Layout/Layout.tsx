
import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
      {sidebarOpen && <Sidebar isMobile={isMobile} closeSidebar={closeSidebar} />}
      <div className={`flex-1 flex flex-col w-full min-w-0 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-0')}`}>
        <Header />
        <main className="flex-1 overflow-hidden w-full bg-white dark:bg-gray-950 m-0">
          <div className="h-full w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
