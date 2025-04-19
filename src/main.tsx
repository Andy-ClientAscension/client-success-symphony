
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Initializing application...");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    
    console.log("Rendering App component...");
    root.render(<App />);
    console.log("App rendered successfully");
  } else {
    console.error("Root element not found in the DOM");
  }
} catch (error) {
  console.error("Fatal error during application initialization:", error);
}
