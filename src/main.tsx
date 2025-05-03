
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSentry } from '@/utils/sentry/config';
import { logStartupPhase, logDetailedError } from '@/utils/errorHandling';
import { registerServiceWorker } from '@/utils/serviceWorkerRegistration';

logStartupPhase("Application initialization starting");

// Add resource hints for critical assets
const addResourceHints = () => {
  const criticalAssets = [
    { rel: 'preload', href: '/src/components/ui/button.tsx', as: 'script' },
    { rel: 'preload', href: '/src/components/ui/card.tsx', as: 'script' },
    { rel: 'prefetch', href: '/src/pages/Dashboard.tsx', as: 'script' },
    { rel: 'prefetch', href: '/src/components/templates/DashboardLayout.tsx', as: 'script' },
    // Add conversion to WebP for images if applicable
    // { rel: 'preload', href: '/images/some-image.webp', as: 'image' }
  ];
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    Object.entries(asset).forEach(([key, value]) => {
      // @ts-ignore - Dynamic property assignment
      link[key] = value;
    });
    document.head.appendChild(link);
  });
};

// Add resource hints as early as possible
addResourceHints();

// Initialize Sentry as early as possible
initializeSentry().then(() => {
  console.log('Sentry initialization completed');
}).catch(error => {
  console.error('Failed to initialize Sentry:', error);
});

// Register service worker for offline support
registerServiceWorker();

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
  logDetailedError(error, `Global error at ${source}:${lineno}:${colno}`);
  console.error("Global error handler caught:", message);
  return false;
};

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  logDetailedError(event.reason, 'Unhandled promise rejection');
  console.error("Unhandled rejection:", event.reason);
});

try {
  logStartupPhase("Looking for root element");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found in DOM");
    throw new Error("Root element not found");
  }
  
  logStartupPhase("Creating React root");
  const root = createRoot(rootElement);
  
  logStartupPhase("About to render App component");
  // Add visibility check for root element
  console.log("Root element:", {
    exists: !!rootElement,
    id: rootElement?.id,
    display: rootElement?.style?.display,
    visibility: rootElement?.style?.visibility,
    className: rootElement?.className,
    childNodes: rootElement?.childNodes?.length
  });
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  logStartupPhase("Render method called successfully");
  
  // Check if anything was rendered
  setTimeout(() => {
    const rootContent = document.getElementById("root");
    console.log("Root element after render:", {
      childNodes: rootContent?.childNodes?.length,
      innerHTML: rootContent?.innerHTML?.substring(0, 100) + (rootContent?.innerHTML?.length > 100 ? '...' : '')
    });
  }, 100);
  
} catch (error) {
  logDetailedError(error, "Fatal error during application initialization");
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      A critical error occurred during application initialization: ${error instanceof Error ? error.message : String(error)}
      <br><br>
      Please check the console for more details.
    </div>
  `;
}
