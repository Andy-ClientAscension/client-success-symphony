import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonTo?: string;
  showHomeButton?: boolean;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backButtonTo = "/",
  showHomeButton = false,
  className,
  children,
  actions
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4 pb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              aria-label="Go back"
            >
              <Link to={backButtonTo}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {showHomeButton && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {children}
    </header>
  );
}