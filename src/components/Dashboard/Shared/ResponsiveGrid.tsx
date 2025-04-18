
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
  rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  rowGap,
  columnGap,
  align,
  justify
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
  const gapClass = rowGap || columnGap ? '' : {
    'none': 'gap-0',
    'xs': 'gap-1',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6'
  }[gap];

  // Set row gap classes if specified
  const rowGapClass = rowGap ? {
    'none': 'gap-y-0',
    'xs': 'gap-y-1',
    'sm': 'gap-y-2',
    'md': 'gap-y-4',
    'lg': 'gap-y-6'
  }[rowGap] : '';

  // Set column gap classes if specified
  const columnGapClass = columnGap ? {
    'none': 'gap-x-0',
    'xs': 'gap-x-1',
    'sm': 'gap-x-2',
    'md': 'gap-x-4',
    'lg': 'gap-x-6'
  }[columnGap] : '';

  // Set alignment classes
  const alignClass = align ? {
    'start': 'items-start',
    'center': 'items-center',
    'end': 'items-end',
    'stretch': 'items-stretch'
  }[align] : '';

  // Set justify classes
  const justifyClass = justify ? {
    'start': 'justify-start',
    'center': 'justify-center',
    'end': 'justify-end',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly'
  }[justify] : '';

  return (
    <div 
      className={cn(
        "grid w-full",
        "min-w-0", // Prevent overflow on small screens
        ...gridClasses,
        gapClass,
        rowGapClass,
        columnGapClass,
        alignClass,
        justifyClass,
        className
      )}
      role="region"
      aria-label="Content Grid"
    >
      {children}
    </div>
  );
}
