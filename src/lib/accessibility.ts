/**
 * Accessibility utilities for ensuring WCAG AA compliance
 */

export const reducedMotionConfig = {
  enableAnimation: () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  duration: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '0s' : '0.2s'
};

export const focusRingClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

export const contrastColors = {
  muted: {
    light: "text-gray-700", // Increased from text-gray-500 for better contrast
    dark: "dark:text-gray-300" // Increased from dark:text-gray-400
  },
  primary: {
    light: "text-gray-900",
    dark: "dark:text-gray-50"
  }
};

/**
 * Announce a message to screen readers using an ARIA live region
 * @param message The message to announce
 * @param priority Either 'polite' (default) or 'assertive'
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  // Create or use existing live region
  let liveRegion = document.getElementById('a11y-announcer');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-announcer';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  } else {
    // Update priority if needed
    liveRegion.setAttribute('aria-live', priority);
  }
  
  // Clear previous content to ensure announcement
  liveRegion.textContent = '';
  
  // Set content in next tick to ensure announcement
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
};

/**
 * Set focus to a specific element, with fallback to a main content area
 * @param elementId The ID of the element to focus, falls back to common main content IDs
 * @param fallbackSelector CSS selector to use if elementId is not found
 * @returns boolean indicating if focus was set successfully
 */
export const setFocusToElement = (elementId?: string, fallbackSelector?: string): boolean => {
  // Try the specified element first if provided
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('tabindex', '-1');
      element.focus({ preventScroll: false });
      return true;
    }
  }
  
  // Try common main content areas
  const commonMainIds = ['main-content', 'main', 'content'];
  for (const id of commonMainIds) {
    const mainElement = document.getElementById(id);
    if (mainElement) {
      mainElement.setAttribute('tabindex', '-1');
      mainElement.focus({ preventScroll: false });
      return true;
    }
  }
  
  // If a fallback selector is provided, try that
  if (fallbackSelector) {
    const fallbackElement = document.querySelector(fallbackSelector) as HTMLElement;
    if (fallbackElement) {
      fallbackElement.setAttribute('tabindex', '-1');
      fallbackElement.focus({ preventScroll: false });
      return true;
    }
  }
  
  // If nothing else works, focus the body
  document.body.focus();
  return false;
};

/**
 * Get a string describing the current keyboard shortcut based on platform
 * @param key The key for the shortcut (e.g., 'k')
 * @param withCmd Whether to include Cmd/Ctrl key
 * @param withShift Whether to include Shift key
 * @param withAlt Whether to include Alt/Option key
 */
export const getKeyboardShortcut = (
  key: string,
  withCmd = false,
  withShift = false,
  withAlt = false
): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt';
  
  let shortcut = '';
  if (withCmd) shortcut += `${cmdKey}+`;
  if (withShift) shortcut += 'Shift+';
  if (withAlt) shortcut += `${altKey}+`;
  shortcut += key.toUpperCase();
  
  return shortcut;
};

/**
 * Creates a focus trap within a specified element
 * @param containerId The element ID to trap focus within
 */
export const setupFocusTrap = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return () => {};
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  document.addEventListener('keydown', handleTabKey);
  
  // Focus first element on setup
  firstElement.focus();
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Check if an element has sufficient color contrast against its background
 * For WCAG AA: normal text needs 4.5:1, large text needs 3:1
 * This is a simplified check - for production use a complete contrast checker
 */
export const hasSufficientContrast = (foreground: string, background: string): boolean => {
  // This is a simplified check that assumes properly formatted hex colors
  // In a real app, use a proper color contrast library
  
  // Simple approximation - convert to grayscale and check difference
  const toGrayscale = (color: string) => {
    // Remove # if present
    color = color.replace('#', '');
    
    // Parse RGB
    let r, g, b;
    if (color.length === 3) {
      r = parseInt(color[0] + color[0], 16);
      g = parseInt(color[1] + color[1], 16);
      b = parseInt(color[2] + color[2], 16);
    } else {
      r = parseInt(color.substr(0, 2), 16);
      g = parseInt(color.substr(2, 2), 16);
      b = parseInt(color.substr(4, 2), 16);
    }
    
    // Approximate luminance
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  
  const fg = toGrayscale(foreground);
  const bg = toGrayscale(background);
  
  // Calculate simple contrast ratio
  const contrast = Math.max(fg, bg) / Math.min(fg, bg);
  
  // WCAG AA requires 4.5:1 for normal text
  return contrast >= 4.5;
};
