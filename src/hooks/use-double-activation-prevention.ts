import { useEffect, useCallback } from 'react';

/**
 * Hook to detect and prevent double-activation of interactive elements
 * Useful for buttons, links, and other clickable elements
 */
export function useDoubleActivationPrevention(delay: number = 300) {
  const activeElements = new Set<string>();

  const preventDoubleActivation = useCallback((
    elementId: string,
    callback: () => void
  ) => {
    // If element is already being processed, ignore
    if (activeElements.has(elementId)) {
      console.warn(`[DoubleActivationPrevention] Ignored duplicate activation for ${elementId}`);
      return false;
    }

    // Mark element as active
    activeElements.add(elementId);

    // Execute callback
    try {
      callback();
    } catch (error) {
      console.error(`[DoubleActivationPrevention] Error in callback for ${elementId}:`, error);
    }

    // Remove from active set after delay
    setTimeout(() => {
      activeElements.delete(elementId);
    }, delay);

    return true;
  }, [delay]);

  // Enhanced click handler that includes double-activation prevention
  const createProtectedHandler = useCallback((
    elementId: string,
    handler: (event: any) => void
  ) => {
    return (event: any) => {
      const executed = preventDoubleActivation(elementId, () => handler(event));
      
      if (!executed) {
        // Prevent default behavior for ignored activations
        event.preventDefault();
        event.stopPropagation();
      }
    };
  }, [preventDoubleActivation]);

  return {
    preventDoubleActivation,
    createProtectedHandler
  };
}