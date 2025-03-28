
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="h-full min-w-full p-4">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
