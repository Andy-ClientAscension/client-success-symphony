import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  columns = { default: 1, sm: 2, lg: 4 },
  gap = 4,
  className 
}: ResponsiveGridProps) => {
  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    `gap-${gap}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: number;
  className?: string;
}

export const ResponsiveContainer = ({ 
  children, 
  maxWidth = '2xl',
  padding = 6,
  className 
}: ResponsiveContainerProps) => {
  const containerClasses = cn(
    'mx-auto w-full',
    maxWidth !== 'full' && `max-w-${maxWidth}`,
    `px-${padding}`,
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

interface BreakpointProps {
  show: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  hide?: boolean;
}

export const Breakpoint = ({ show, children, hide = false }: BreakpointProps) => {
  const classes = cn(
    hide ? 'hidden' : 'block',
    `${show}:${hide ? 'hidden' : 'block'}`
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TouchTarget = ({ children, className, size = 'md' }: TouchTargetProps) => {
  const sizeClasses = {
    sm: 'min-h-[40px] min-w-[40px]', // WCAG minimum for small
    md: 'min-h-[44px] min-w-[44px]', // WCAG AA standard
    lg: 'min-h-[48px] min-w-[48px]'  // More comfortable
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};