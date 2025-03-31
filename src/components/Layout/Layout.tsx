
import React from "react";
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
  
  return (
    <div className={`flex h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-slate-50 text-gray-900'}`}>
      <Sidebar />
      <div className={`flex-1 flex flex-col w-full min-w-0 ${isMobile ? 'ml-0' : 'ml-56'}`}>
        <Header />
        <div className="flex items-center justify-end px-4 py-2 border-b">
          <RenewalNotifier />
        </div>
        <main className="flex-1 overflow-hidden w-full">
          <ScrollArea className="h-full w-full" orientation="both">
            <div className="p-4">
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
