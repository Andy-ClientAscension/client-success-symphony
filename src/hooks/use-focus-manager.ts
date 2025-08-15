import { useEffect, useRef } from 'react';

interface FocusManagerOptions {
  trapFocus?: boolean;
  returnFocus?: boolean;
  autoFocus?: boolean;
}

/**
 * Hook for managing focus during navigation and interactions
 * Prevents double-activation by ensuring proper focus handling
 */
export function useFocusManager(options: FocusManagerOptions = {}) {
  const { trapFocus = false, returnFocus = true, autoFocus = false } = options;
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Store the currently focused element before navigation
  const storePreviousFocus = () => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
  };

  // Return focus to previously focused element
  const restorePreviousFocus = () => {
    if (returnFocus && previouslyFocusedElement.current) {
      try {
        previouslyFocusedElement.current.focus();
      } catch (error) {
        console.warn('Could not restore focus:', error);
      }
    }
  };

  // Focus the first focusable element in container
  const focusFirstElement = () => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  // Trap focus within container
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;
    if (e.key !== 'Tab') return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  // Setup focus management
  useEffect(() => {
    if (autoFocus) {
      focusFirstElement();
    }

    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (trapFocus) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [trapFocus, autoFocus]);

  return {
    containerRef,
    storePreviousFocus,
    restorePreviousFocus,
    focusFirstElement
  };
}