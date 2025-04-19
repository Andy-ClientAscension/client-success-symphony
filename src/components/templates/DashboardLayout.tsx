
import { Layout } from "@/components/Layout/Layout";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <Layout>{children}</Layout>;
}

