import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )} 
    />
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({ title, description, className }: LoadingCardProps) {
  return (
    <div className={cn("p-6 space-y-4 rounded-lg border bg-card", className)}>
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="sm" />
        <div className="space-y-2 flex-1">
          {title && <Skeleton className="h-5 w-[200px]" />}
          {description && <Skeleton className="h-4 w-[300px]" />}
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text = "Loading...", className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function PageLoading({ title = "Loading", description }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
    </div>
  );
}