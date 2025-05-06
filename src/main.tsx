
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { AuthStateMachineProvider } from '@/contexts/auth-state-machine';
import { SessionValidatorProvider } from '@/contexts/SessionValidatorContext';
import { Toaster } from '@/components/ui/toaster';
import { TimeoutCoordinatorProvider } from './hooks/use-timeout-coordinator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TimeoutCoordinatorProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AuthStateMachineProvider>
              <AuthContextProvider>
                <SessionValidatorProvider>
                  <Toaster />
                  <App />
                </SessionValidatorProvider>
              </AuthContextProvider>
            </AuthStateMachineProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </TimeoutCoordinatorProvider>
    </ThemeProvider>
  </React.StrictMode>
);
