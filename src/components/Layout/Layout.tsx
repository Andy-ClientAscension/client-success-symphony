
import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
