
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import AddClient from './pages/AddClient';
import Analytics from './pages/Analytics';
import Communications from './pages/Communications';
import HealthScoreDashboard from './pages/HealthScoreDashboard';
import Payments from './pages/Payments';
import Renewals from './pages/Renewals';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import { OfflineDetector } from './components/OfflineDetector';
import Automations from './pages/Automations';

const queryClient = new QueryClient();

// Simple fallback component for the ErrorBoundary
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
    <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mb-4 text-gray-700">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Refresh the page
      </button>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary fallbackRender={({ error }) => <ErrorFallback error={error} />}>
            <AuthProvider>
              <div className="app">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetails />} />
                  <Route path="/add-client" element={<AddClient />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/health-score" element={<HealthScoreDashboard />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/renewals" element={<Renewals />} />
                  <Route path="/automations" element={<Automations />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <OfflineDetector />
              <Toaster />
            </AuthProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
