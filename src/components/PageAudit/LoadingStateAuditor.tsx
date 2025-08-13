import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LoadingState {
  component: string;
  hasLoadingState: boolean;
  hasErrorState: boolean;
  hasEmptyState: boolean;
  element?: Element;
}

export function LoadingStateAuditor() {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const auditLoadingStates = async () => {
    setIsAuditing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const states: LoadingState[] = [];
    
    // Check for common loading indicators
    const loadingElements = document.querySelectorAll('[data-loading], .loading, .spinner, [aria-busy="true"]');
    const errorElements = document.querySelectorAll('[data-error], .error, .alert-destructive');
    const emptyElements = document.querySelectorAll('[data-empty], .empty-state, .no-data');
    
    // Check data containers
    const dataContainers = document.querySelectorAll('[data-testid*="list"], [data-testid*="table"], [data-testid*="grid"], .grid, .table, ul, ol');
    
    dataContainers.forEach((container, index) => {
      const hasLoadingState = container.querySelector('[data-loading], .loading, .spinner') !== null;
      const hasErrorState = container.querySelector('[data-error], .error') !== null;
      const hasEmptyState = container.querySelector('[data-empty], .empty-state') !== null || 
                           container.textContent?.includes('No data') ||
                           container.textContent?.includes('No items') ||
                           container.textContent?.includes('No results');
      
      states.push({
        component: container.getAttribute('data-testid') || `Container ${index + 1}`,
        hasLoadingState,
        hasErrorState,
        hasEmptyState,
        element: container
      });
    });

    setLoadingStates(states);
    setIsAuditing(false);
  };

  const highlightElement = (element?: Element) => {
    if (!element) return;
    
    const el = element as HTMLElement;
    el.style.outline = '2px solid blue';
    el.style.outlineOffset = '2px';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }, 3000);
  };

  useEffect(() => {
    auditLoadingStates();
  }, []);

  const issuesFound = loadingStates.filter(state => 
    !state.hasLoadingState || !state.hasErrorState || !state.hasEmptyState
  );

  if (isAuditing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Auditing loading states...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Loading States Audit
          <Button onClick={auditLoadingStates} variant="outline" size="sm">
            Re-audit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{loadingStates.length}</div>
            <div className="text-sm text-muted-foreground">Components Checked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{issuesFound.length}</div>
            <div className="text-sm text-muted-foreground">Missing States</div>
          </div>
        </div>

        <div className="space-y-2">
          {loadingStates.map((state, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{state.component}</span>
                <div className="flex space-x-1 mt-1">
                  <Badge variant={state.hasLoadingState ? "default" : "destructive"} className="text-xs">
                    Loading {state.hasLoadingState ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={state.hasErrorState ? "default" : "destructive"} className="text-xs">
                    Error {state.hasErrorState ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={state.hasEmptyState ? "default" : "destructive"} className="text-xs">
                    Empty {state.hasEmptyState ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => highlightElement(state.element)}
                className="h-6 px-2"
              >
                Locate
              </Button>
            </div>
          ))}
        </div>

        {loadingStates.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No data containers found to audit
          </div>
        )}
      </CardContent>
    </Card>
  );
}