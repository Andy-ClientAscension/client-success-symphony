
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from "@/components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// All authentication providers disabled for development
import { Toaster } from '@/components/ui/toaster';
import { TimeoutCoordinatorProvider } from './hooks/use-timeout-coordinator';
import { BrowserRouter } from 'react-router-dom';
import { initializeMonitoring } from '@/utils/monitoring';
import { validateEnvironment } from '@/utils/environment';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Initialize production monitoring
const monitoringConfig = initializeMonitoring();
console.log('Monitoring initialized:', monitoringConfig);

// Validate environment configuration
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.warn('Environment validation failed:', envValidation.missingVars);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TimeoutCoordinatorProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <App />
          </QueryClientProvider>
        </BrowserRouter>
      </TimeoutCoordinatorProvider>
    </ThemeProvider>
  </React.StrictMode>
);
