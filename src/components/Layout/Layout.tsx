
import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 ml-56"> {/* Changed from pl-56 to ml-56 for better layout */}
        <Header />
        <main className="flex-1 overflow-hidden w-full">
          <ScrollArea className="h-full w-full" orientation="both">
            <div className="p-4"> {/* Removed min-w-max to prevent forced width */}
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
