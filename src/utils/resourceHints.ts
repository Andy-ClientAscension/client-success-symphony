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

/**
 * Prefetch route components that might be needed soon
 * @param routePath The route path to prefetch
 */
export function prefetchRoute(routePath: string): void {
  // Create a link rel=prefetch for the JavaScript bundle
  const prefetchLink = document.createElement('link');
  prefetchLink.rel = 'prefetch';
  prefetchLink.as = 'script';
  
  switch (routePath) {
    case '/dashboard':
      prefetchLink.href = '/src/pages/Dashboard.tsx';
      break;
    case '/analytics':
      prefetchLink.href = '/src/pages/Analytics.tsx';
      break;
    case '/clients':
      prefetchLink.href = '/src/pages/Clients.tsx';
      break;
    default:
      // Don't create a prefetch link for unknown routes
      return;
  }
  
  // Add the prefetch link if it's not already in the document
  const existingLink = document.querySelector(`link[rel="prefetch"][href="${prefetchLink.href}"]`);
  if (!existingLink) {
    document.head.appendChild(prefetchLink);
    
    // Remove after 10 seconds to keep the DOM clean
    setTimeout(() => {
      if (prefetchLink.parentNode) {
        prefetchLink.parentNode.removeChild(prefetchLink);
      }
    }, 10000);
  }
}

/**
 * Optimize app by preconnecting to domains before they're needed
 */
export function setupPreconnections(): void {
  const domains = [
    // Add domains that your app connects to frequently
    // Example: 'https://api.example.com',
    // Example: 'https://fonts.googleapis.com',
    location.origin, // Always preconnect to own origin for API calls
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Also add dns-prefetch as fallback for browsers that don't support preconnect
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = domain;
    document.head.appendChild(dnsLink);
  });
}
