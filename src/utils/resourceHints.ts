
/**
 * Utility functions for resource hints like preload, prefetch, and preconnect
 * These optimizations help improve performance across the app
 */

/**
 * Creates a preload link for critical resources
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  // Don't add duplicate preload links
  if (!document.head.querySelector(`link[rel="preload"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Creates a prefetch link for resources likely to be needed soon
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  // Don't add duplicate prefetch links
  if (!document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Creates a preconnect link to establish early connections
 */
export function preconnect(url: string, crossorigin: boolean = false): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  
  // Don't add duplicate preconnect links
  if (!document.head.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
    document.head.appendChild(link);
  }
}

/**
 * Preload critical assets for a specific route
 */
export function preloadPageResources(pageName: string): void {
  switch (pageName) {
    case 'dashboard':
      // Preload critical dashboard assets
      preloadResource('/assets/dashboard-icons.svg', 'image');
      prefetchResource('/src/components/Dashboard/DashboardComponents.tsx');
      prefetchResource('/src/components/Dashboard/Metrics/HeroMetrics.tsx');
      break;
    
    case 'clients':
      // Preload critical clients page assets
      prefetchResource('/src/components/Dashboard/ClientList/ClientList.tsx');
      prefetchResource('/src/components/Dashboard/ClientList/ClientListContent.tsx');
      break;
    
    case 'analytics':
      // Preload critical analytics assets
      prefetchResource('/src/components/Dashboard/Charts/TimeSeriesChart.tsx');
      prefetchResource('/src/components/Dashboard/Charts/UnifiedMetricChart.tsx');
      break;
      
    default:
      // Common resources across pages
      preconnect('https://fonts.googleapis.com');
      preconnect('https://fonts.gstatic.com', true);
  }
}

/**
 * Prefetch a route for faster navigation
 */
export function prefetchRoute(path: string): void {
  // Extract route name from path
  const routeName = path.split('/')[1] || 'dashboard';
  
  // Prefetch main route module
  prefetchResource(`/src/pages/${routeName.charAt(0).toUpperCase() + routeName.slice(1)}.tsx`);
  
  // Also preload resources for that page
  preloadPageResources(routeName);
}
