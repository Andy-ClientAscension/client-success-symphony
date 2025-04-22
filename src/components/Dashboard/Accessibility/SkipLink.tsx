
import React from 'react';
import { focusRingClasses } from '@/lib/accessibility';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ targetId, label = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-background z-50 px-4 py-2 rounded-md border border-border
        text-foreground font-medium ${focusRingClasses}
      `}
    >
      {label}
    </a>
  );
}
