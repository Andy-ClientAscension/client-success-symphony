import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route mapping for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'clients': 'Clients',
  'analytics': 'Analytics',
  'renewals': 'Renewals',
  'communications': 'Communications',
  'payments': 'Payments',
  'automations': 'Automations',
  'settings': 'Settings',
  'health-score-dashboard': 'Health Scores',
  'ai-dashboard': 'AI Insights',
  'UnifiedDashboard': 'Unified Dashboard',
  'pre-launch': 'Pre-Launch Checklist'
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Generate breadcrumbs from current path if items not provided
  const breadcrumbs = items || generateBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single level navigation
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.path || ''}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />
              )}
              
              {isLast ? (
                <span className="flex items-center font-medium text-foreground">
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path || '/'}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: Home
    }
  ];

  let currentPath = '';
  
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Get label from route mapping or format the segment
    const label = routeLabels[segment] || formatSegment(segment);
    
    breadcrumbs.push({
      label,
      path: currentPath
    });
  });

  return breadcrumbs;
}

function formatSegment(segment: string): string {
  // Handle IDs (UUIDs or numeric)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || 
      /^\d+$/.test(segment)) {
    return 'Details';
  }
  
  // Format kebab-case and snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Custom breadcrumb hook for complex scenarios
export function useBreadcrumbs() {
  const location = useLocation();
  
  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    // This could store breadcrumbs in context if needed for complex apps
    return items;
  };

  const generateFromPath = () => {
    return generateBreadcrumbs(location.pathname);
  };

  return {
    setBreadcrumbs,
    generateFromPath,
    currentPath: location.pathname
  };
}