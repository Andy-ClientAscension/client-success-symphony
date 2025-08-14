import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Package, 
  Clock, 
  Database, 
  Monitor,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'bundle' | 'react' | 'queries' | 'memory';
  estimatedImprovement: string;
  implementation: string[];
}

const OPTIMIZATION_SUGGESTIONS: OptimizationSuggestion[] = [
  {
    id: 'code-splitting',
    title: 'Implement Code Splitting',
    description: 'Split large bundles into smaller chunks to improve initial load time',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    category: 'bundle',
    estimatedImprovement: '40% faster initial load',
    implementation: [
      'Add React.lazy() for route components',
      'Implement dynamic imports for heavy components',
      'Use Suspense boundaries for loading states'
    ]
  },
  {
    id: 'component-memoization',
    title: 'Optimize Component Re-renders',
    description: 'Add React.memo to frequently re-rendering components',
    priority: 'high',
    impact: 'high',
    effort: 'medium',
    category: 'react',
    estimatedImprovement: '30% fewer re-renders',
    implementation: [
      'Wrap expensive components with React.memo',
      'Optimize prop passing to prevent unnecessary renders',
      'Use useCallback for event handlers in memoized components'
    ]
  },
  {
    id: 'query-batching',
    title: 'Batch Related Queries',
    description: 'Combine multiple related API calls into single requests',
    priority: 'medium',
    impact: 'medium',
    effort: 'medium',
    category: 'queries',
    estimatedImprovement: '25% fewer network requests',
    implementation: [
      'Create batched query hooks for dashboard data',
      'Implement query deduplication',
      'Add intelligent caching strategies'
    ]
  },
  {
    id: 'list-virtualization',
    title: 'Virtualize Large Lists',
    description: 'Implement virtualization for lists with many items',
    priority: 'medium',
    impact: 'high',
    effort: 'high',
    category: 'react',
    estimatedImprovement: '50% better list performance',
    implementation: [
      'Use react-window or @tanstack/react-virtual',
      'Implement proper height calculations',
      'Add sticky headers and scroll restoration'
    ]
  },
  {
    id: 'bundle-analysis',
    title: 'Analyze and Optimize Bundle',
    description: 'Identify and remove unused dependencies',
    priority: 'high',
    impact: 'medium',
    effort: 'low',
    category: 'bundle',
    estimatedImprovement: '20-30% smaller bundle',
    implementation: [
      'Run webpack-bundle-analyzer',
      'Remove unused dependencies',
      'Tree-shake unused exports'
    ]
  },
  {
    id: 'memory-optimization',
    title: 'Optimize Memory Usage',
    description: 'Reduce memory consumption and prevent leaks',
    priority: 'low',
    impact: 'medium',
    effort: 'medium',
    category: 'memory',
    estimatedImprovement: '15-20% lower memory usage',
    implementation: [
      'Add proper cleanup in useEffect',
      'Implement object pooling for frequent allocations',
      'Use WeakMap for component references'
    ]
  }
];

interface OptimizationSuggestionsProps {
  currentIssues?: string[];
  onImplementSuggestion?: (suggestionId: string) => void;
}

export function OptimizationSuggestions({ 
  currentIssues = [], 
  onImplementSuggestion 
}: OptimizationSuggestionsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bundle': return Package;
      case 'react': return Monitor;
      case 'queries': return Database;
      case 'memory': return TrendingUp;
      default: return Zap;
    }
  };

  const getEffortBadge = (effort: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[effort as keyof typeof colors] || colors.medium;
  };

  // Sort suggestions by priority and impact
  const sortedSuggestions = [...OPTIMIZATION_SUGGESTIONS].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const impactWeight = { high: 3, medium: 2, low: 1 };
    
    const aScore = priorityWeight[a.priority] + impactWeight[a.impact];
    const bScore = priorityWeight[b.priority] + impactWeight[b.impact];
    
    return bScore - aScore;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Performance Optimization Suggestions
        </h3>
        <Badge variant="outline">
          {sortedSuggestions.filter(s => s.priority === 'high').length} High Priority
        </Badge>
      </div>

      {currentIssues.length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Current Performance Issues Detected:</strong>
            <ul className="list-disc ml-4 mt-2">
              {currentIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {sortedSuggestions.map((suggestion) => {
          const CategoryIcon = getCategoryIcon(suggestion.category);
          
          return (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority} priority
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getEffortBadge(suggestion.effort)}
                    >
                      {suggestion.effort} effort
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Expected Impact</div>
                    <div className={`font-semibold ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.estimatedImprovement}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="font-semibold capitalize">{suggestion.category}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Implementation Steps</div>
                  <ul className="text-sm space-y-1">
                    {suggestion.implementation.map((step, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {onImplementSuggestion && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onImplementSuggestion(suggestion.id)}
                    className="w-full"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Implement Optimization
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Phase 1 (1-2 days):</strong> Code splitting and bundle analysis - Immediate 40% load time improvement
            </div>
            <div>
              <strong>Phase 2 (2-3 days):</strong> Component optimization and memoization - 30% fewer re-renders
            </div>
            <div>
              <strong>Phase 3 (1-2 days):</strong> Query batching and caching improvements - 25% fewer requests
            </div>
            <div>
              <strong>Phase 4 (3-5 days):</strong> Advanced optimizations like virtualization - 50% better list performance
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}