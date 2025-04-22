
import React from "react";
import { cn } from "@/lib/utils";

type GridColumns = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

type GridGap = "xs" | "sm" | "md" | "lg" | "xl";

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols: GridColumns;
  gap?: GridGap;
  className?: string;
  [key: string]: any;
}

export function ResponsiveGrid({
  children,
  cols,
  gap = "md",
  className,
  ...props
}: ResponsiveGridProps) {
  const colClasses = {
    xs: cols.xs ? `grid-cols-${cols.xs}` : "grid-cols-1",
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    md: cols.md ? `md:grid-cols-${cols.md}` : "",
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : "",
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : "",
  };
  
  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        colClasses.xs,
        colClasses.sm,
        colClasses.md,
        colClasses.lg,
        colClasses.xl,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
