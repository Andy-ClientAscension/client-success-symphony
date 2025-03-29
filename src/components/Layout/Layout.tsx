
import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 ml-56"> {/* Changed from pl-56 to ml-56 for better layout */}
        <Header />
        <main className="flex-1 overflow-hidden w-full">
          <ScrollArea className="h-full w-full" orientation="both">
            <div className="p-4 dark:text-gray-200"> {/* Added dark mode text color */}
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
