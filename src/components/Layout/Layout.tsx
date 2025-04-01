
import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { RenewalNotifier } from "@/components/Dashboard/RenewalNotifier";

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
    <div className={`flex h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-900'}`}>
      {sidebarOpen && <Sidebar isMobile={isMobile} closeSidebar={closeSidebar} />}
      <div className={`flex-1 flex flex-col w-full min-w-0 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-0')}`}>
        <Header />
        <main className="flex-1 overflow-hidden w-full bg-slate-50 dark:bg-gray-900">
          <ScrollArea className="h-full w-full" orientation="both">
            <div className="px-6 py-4">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </ScrollArea>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
