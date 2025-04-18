
import React from "react";
import { cn } from "@/lib/utils";

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: GridColumns; // Extra small (mobile)
    sm?: GridColumns; // Small
    md?: GridColumns; // Medium
    lg?: GridColumns; // Large
    xl?: GridColumns; // Extra large
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  // Convert column numbers to tailwind grid classes
  const getColsClass = (size: GridColumns): string => {
    const colsMap: Record<GridColumns, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      6: "grid-cols-6",
      12: "grid-cols-12",
    };
    return colsMap[size];
  };

  // Build responsive grid classes
  const gridClasses: string[] = [];
  
  if (cols.xs) gridClasses.push(getColsClass(cols.xs));
  if (cols.sm) gridClasses.push(`sm:${getColsClass(cols.sm)}`);
  if (cols.md) gridClasses.push(`md:${getColsClass(cols.md)}`);
  if (cols.lg) gridClasses.push(`lg:${getColsClass(cols.lg)}`);
  if (cols.xl) gridClasses.push(`xl:${getColsClass(cols.xl)}`);

  // Set gap classes
  const gapClass = {
    'none': 'gap-0',
    'xs': 'gap-1',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6'
  }[gap];

  return (
    <div className={cn(
      "grid",
      ...gridClasses,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}

// Export all responsive layout components for easier imports
export { StyledCard, MetricItem } from "../Shared/CardStyle";
export { ResponsiveTable } from "../Shared/ResponsiveTable";
export type { Column } from "../Shared/ResponsiveTable";
