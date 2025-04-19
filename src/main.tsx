
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application initialization starting...");

// Check for DOM readiness
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM is fully loaded and parsed");
});

try {
  console.log("Looking for root element...");
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    
    console.log("About to render App component...");
    root.render(<App />);
    console.log("Render method called successfully");
  } else {
    console.error("Critical error: Root element not found in the DOM");
    // Try to add a visible error message to the body if possible
    document.body.innerHTML = `
      <div style="color: red; padding: 20px;">
        Error: Could not find root element. Please check the console for more information.
      </div>
    `;
  }
} catch (error) {
  console.error("Fatal error during application initialization:", error);
  // Try to add a visible error message to the body
  try {
    document.body.innerHTML = `
      <div style="color: red; padding: 20px;">
        A critical error occurred while initializing the application: ${error instanceof Error ? error.message : String(error)}
      </div>
    `;
  } catch (e) {
    console.error("Could not render error message to DOM:", e);
  }
}
