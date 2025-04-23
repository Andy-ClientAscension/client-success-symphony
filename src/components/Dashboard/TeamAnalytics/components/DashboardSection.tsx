
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <Collapsible defaultOpen={false}>
      <div className="flex items-center justify-between pb-4">
        <span className="text-base font-semibold">{title}</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center text-xs font-medium space-x-1 rounded px-2 py-1 hover:bg-muted transition">
            <span>Show Details</span>
            <Plus className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
