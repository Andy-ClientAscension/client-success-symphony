import React, { useEffect, useRef } from 'react';
import { announceToScreenReader } from '@/lib/accessibility';

interface SkipLinkProps {
  targetId: string;
  text?: string;
}

export const SkipLink = ({ targetId, text = "Skip to main content" }: SkipLinkProps) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    onFocus={() => announceToScreenReader('Skip link activated', 'polite')}
  >
    {text}
  </a>
);

interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}

export const LiveRegion = ({ children, level = 'polite', atomic = false }: LiveRegionProps) => (
  <div
    aria-live={level}
    aria-atomic={atomic}
    className="sr-only"
  >
    {children}
  </div>
);

interface FocusTrapProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const FocusTrap = ({ children, enabled }: FocusTrapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0] as HTMLElement;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

interface HighContrastProps {
  children: React.ReactNode;
  className?: string;
}

export const HighContrastWrapper = ({ children, className }: HighContrastProps) => {
  const [highContrast, setHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`${highContrast ? 'high-contrast' : ''} ${className || ''}`}>
      {children}
    </div>
  );
};