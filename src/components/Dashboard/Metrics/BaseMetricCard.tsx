
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BaseMetricCardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function BaseMetricCard({ title, className, children }: BaseMetricCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-3">
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground">{title}</p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
