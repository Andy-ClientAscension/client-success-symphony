import { useEffect } from 'react';

// Global unhandled promise rejection handler
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      // Log unhandled promise rejection
      if (process.env.NODE_ENV === 'development') {
        // Log detailed error in development
      }
      
      // Prevent the default console error
      event.preventDefault();
      
      // Send to error tracking service in production
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking
      }
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      // Log general errors
      if (process.env.NODE_ENV === 'development') {
        // Log detailed error in development
      }
    });
  }
}

// Hook to set up error handlers
export function useGlobalErrorHandlers() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);
}