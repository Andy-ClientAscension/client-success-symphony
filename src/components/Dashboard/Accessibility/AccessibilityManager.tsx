
import React, { useEffect } from 'react';
import { SkipLink } from './SkipLink';
import { KeyboardNavigationGuide } from './KeyboardNavigationGuide';
import { announceToScreenReader } from '@/lib/accessibility';

interface AccessibilityManagerProps {
  mainContentId: string;
  pageTitle: string;
  children?: React.ReactNode;
}

export function AccessibilityManager({ 
  mainContentId, 
  pageTitle, 
  children 
}: AccessibilityManagerProps) {
  // Announce page title when component mounts (for screen readers)
  useEffect(() => {
    announceToScreenReader(`${pageTitle} page loaded`, 'polite');
  }, [pageTitle]);

  // Set up keyboard shortcuts for the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1: Focus main content
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const mainElement = document.getElementById(mainContentId);
        if (mainElement) {
          mainElement.tabIndex = -1;
          mainElement.focus();
          announceToScreenReader(`Navigated to main content`, 'polite');
        }
      }
      
      // Alt + / : Show keyboard shortcuts
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        // Find keyboard help button and click it
        const helpButton = document.querySelector('[aria-label*="keyboard" i]') as HTMLButtonElement;
        if (helpButton) {
          helpButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mainContentId]);

  return (
    <>
      <SkipLink targetId={mainContentId} />
      {children}
    </>
  );
}
