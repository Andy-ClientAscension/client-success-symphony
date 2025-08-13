import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingState, CardSkeleton } from '@/components/ui/sync-indicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Lazy-loaded components for better performance
const HeavyChart = lazy(() => import('@/components/Dashboard/Charts/HeavyChart'));
const DataTable = lazy(() => import('@/components/Dashboard/Tables/DataTable'));
const AnalyticsWidget = lazy(() => import('@/components/Dashboard/Widgets/AnalyticsWidget'));
const ReportsWidget = lazy(() => import('@/components/Dashboard/Widgets/ReportsWidget'));

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback, errorFallback }: LazyComponentProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        errorFallback || (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load component: {error.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetErrorBoundary}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )
      )}
    >
      <Suspense fallback={fallback || <CardSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Pre-configured lazy components with optimized loading
export const LazyHeavyChart = () => (
  <LazyWrapper fallback={<LoadingState isLoading message="Loading chart..." />}>
    <HeavyChart />
  </LazyWrapper>
);

export const LazyDataTable = () => (
  <LazyWrapper fallback={<LoadingState isLoading message="Loading data table..." />}>
    <DataTable />
  </LazyWrapper>
);

export const LazyAnalyticsWidget = () => (
  <LazyWrapper fallback={<CardSkeleton />}>
    <AnalyticsWidget />
  </LazyWrapper>
);

export const LazyReportsWidget = () => (
  <LazyWrapper fallback={<CardSkeleton />}>
    <ReportsWidget />
  </LazyWrapper>
);

// Hook for managing lazy loading state
export function useLazyLoading() {
  const preloadComponent = (componentImport: () => Promise<any>) => {
    // Preload on user interaction (hover, focus, etc.)
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.as = 'script';
    document.head.appendChild(link);
    
    // Actually import the component
    componentImport().catch(() => {
      // Silently handle preload failures
    });
  };

  const loadOnVisible = (
    element: HTMLElement | null,
    componentImport: () => Promise<any>,
    options = { rootMargin: '50px' }
  ) => {
    if (!element || !('IntersectionObserver' in window)) {
      componentImport();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            componentImport();
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  };

  return {
    preloadComponent,
    loadOnVisible
  };
}

// Code splitting for routes
export const lazyRoutes = {
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Analytics: lazy(() => import('@/pages/Analytics')),
  Clients: lazy(() => import('@/pages/Clients')),
  AIDashboard: lazy(() => import('@/pages/AIDashboard')),
  Settings: lazy(() => import('@/pages/Settings')),
  Communications: lazy(() => import('@/pages/Communications')),
  Payments: lazy(() => import('@/pages/Payments')),
  Automations: lazy(() => import('@/pages/Automations')),
  Renewals: lazy(() => import('@/pages/Renewals')),
  HealthScoreDashboard: lazy(() => import('@/pages/HealthScoreDashboard'))
};

// Bundle analyzer helper (for development)
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    import('source-map-explorer').then((sme) => {
      console.log('Bundle analysis available');
      // This would show bundle composition in development
    }).catch(() => {
      console.log('Bundle analyzer not available');
    });
  }
};