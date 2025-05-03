
/**
 * Creates and adds resource hints to the document head
 * @param resources Array of resource hint configurations
 */
export function addResourceHints(resources: ResourceHint[]): void {
  resources.forEach(resource => {
    // Skip if this resource hint already exists
    const existingLink = document.querySelector(
      `link[rel="${resource.rel}"][href="${resource.href}"]`
    );
    
    if (existingLink) {
      return;
    }
    
    const link = document.createElement('link');
    
    // Add all properties to the link element
    Object.entries(resource).forEach(([key, value]) => {
      // @ts-ignore - We need to allow dynamic property assignment
      link[key] = value;
    });
    
    document.head.appendChild(link);
    
    // For debugging
    console.debug(`Added resource hint: ${resource.rel} for ${resource.href}`);
  });
}

/**
 * Resource hint configuration
 */
export interface ResourceHint {
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';
  href: string;
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch';
  type?: string;
  crossOrigin?: string;
  media?: string;
  [key: string]: any;
}

/**
 * Preload critical resources for the current page
 * @param pageName The current page name
 */
export function preloadPageResources(pageName: string): void {
  const resourcesByPage: Record<string, ResourceHint[]> = {
    dashboard: [
      { rel: 'preload', href: '/src/components/Dashboard/Metrics/HeroMetrics.tsx', as: 'script' },
      { rel: 'preload', href: '/src/components/Dashboard/Metrics/MetricsCards.tsx', as: 'script' },
      { rel: 'prefetch', href: '/src/components/Dashboard/Charts/UnifiedMetricChart.tsx', as: 'script' }
    ],
    analytics: [
      { rel: 'preload', href: '/src/components/Dashboard/Charts/TimeSeriesChart.tsx', as: 'script' },
      { rel: 'prefetch', href: '/src/components/Dashboard/TeamAnalytics/TeamAnalyticsTab.tsx', as: 'script' }
    ],
    clients: [
      { rel: 'preload', href: '/src/components/Dashboard/ClientList/ClientList.tsx', as: 'script' },
      { rel: 'prefetch', href: '/src/components/Dashboard/KanbanView/ClientKanbanView.tsx', as: 'script' }
    ]
  };
  
  const resources = resourcesByPage[pageName] || [];
  
  if (resources.length > 0) {
    addResourceHints(resources);
  }
}
