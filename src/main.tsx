
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application initialization starting...");

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      A critical error occurred: ${message}
    </div>
  `;
  return false;
};

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  console.log("Looking for root element...");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found in DOM");
    throw new Error("Root element not found");
  }
  
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  
  console.log("About to render App component...");
  // Add visibility check for root element
  console.log("Root element:", {
    exists: !!rootElement,
    id: rootElement?.id,
    display: rootElement?.style?.display
  });
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Render method called successfully");
  
} catch (error) {
  console.error("Fatal error during application initialization:", error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      A critical error occurred during application initialization: ${error instanceof Error ? error.message : String(error)}
      <br><br>
      Please check the console for more details.
    </div>
  `;
}
