import React from 'react';
import { cn } from '@/lib/utils';

interface InteractiveElementProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'button' | 'link' | 'card';
  href?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * Standardized interactive element that prevents double-activation
 * Uses proper semantic HTML based on the intended behavior
 */
export function InteractiveElement({
  variant = 'button',
  href,
  children,
  className,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}: InteractiveElementProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Prevent double-activation from Enter and Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onClick?.(e as any);
    }
    onKeyDown?.(e);
  };

  const baseClasses = cn(
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    "transition-colors duration-200",
    className
  );

  // If href is provided, use anchor element
  if (href) {
    return (
      <a
        href={href}
        className={cn(
          baseClasses,
          "inline-flex items-center justify-center rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "no-underline"
        )}
        aria-label={ariaLabel}
        data-testid={testId}
        onClick={onClick as any}
      >
        {children}
      </a>
    );
  }

  // Use button element for all other interactions
  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        variant === 'card' && "text-left w-full rounded-lg border border-border hover:bg-accent/50",
        variant === 'link' && "inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground",
        variant === 'button' && "inline-flex items-center justify-center rounded-md"
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  );
}