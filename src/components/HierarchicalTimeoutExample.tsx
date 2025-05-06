
import React, { useState, useEffect } from 'react';
import { useNavigationTimeout } from '@/hooks/use-navigation-timeout';
import { useTimeoutCoordinator, useCoordinatedTimeout } from '@/hooks/use-timeout-coordinator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TimeoutDisplayProps {
  name: string;
  parentId?: string;
}

function TimeoutDisplay({ name, parentId }: TimeoutDisplayProps) {
  const [active, setActive] = useState(false);
  const { timeoutId, startTimeout, clearTimeout } = useCoordinatedTimeout(parentId, {
    description: `${name} timeout triggered`,
    onTimeout: () => setActive(false)
  });
  
  const handleStart = () => {
    startTimeout(10000);
    setActive(true);
  };
  
  const handleStop = () => {
    clearTimeout();
    setActive(false);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>
          {parentId ? `Child of ${parentId}` : 'Root timeout'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            Status: <span className={active ? "text-green-500" : "text-red-500"}>
              {active ? "Active" : "Inactive"}
            </span>
            {active && timeoutId && <div className="text-sm text-muted-foreground mt-1">ID: {timeoutId}</div>}
          </div>
          <div className="space-x-2">
            <Button 
              size="sm" 
              onClick={handleStart} 
              disabled={active}
              variant="outline"
            >
              Start
            </Button>
            <Button 
              size="sm" 
              onClick={handleStop} 
              disabled={!active}
              variant="destructive"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HierarchicalTimeoutExample() {
  const [parentId, setParentId] = useState<string | null>(null);
  const { clearAll, activeTimeouts } = useTimeoutCoordinator();
  const { startTimeout, clearTimeout, timeoutId } = useNavigationTimeout({
    delay: 30000,
    showToast: true,
    timeoutMessage: 'Parent navigation timeout triggered'
  });
  
  const handleStartParent = () => {
    const id = startTimeout('/example');
    setParentId(id || null);
  };
  
  const handleClearParent = () => {
    clearTimeout();
    setParentId(null);
  };
  
  const activeCount = activeTimeouts ? activeTimeouts.size : 0;
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hierarchical Timeout Example</h2>
        <Button variant="secondary" onClick={clearAll}>Clear All Timeouts</Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Active timeouts: {activeCount}
      </div>
      
      <div className="border p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-4">Parent Navigation Timeout</h3>
        <div className="flex items-center justify-between">
          <div>
            Status: <span className={parentId ? "text-green-500" : "text-red-500"}>
              {parentId ? "Active" : "Inactive"}
            </span>
            {parentId && <div className="text-sm text-muted-foreground mt-1">ID: {parentId}</div>}
          </div>
          <div className="space-x-2">
            <Button onClick={handleStartParent} disabled={!!parentId}>Start Parent</Button>
            <Button onClick={handleClearParent} disabled={!parentId} variant="destructive">
              Cancel Parent & Children
            </Button>
          </div>
        </div>
      </div>
      
      {/* Child timeouts that will be cancelled when parent is cancelled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Child Timeouts</h3>
          <TimeoutDisplay name="Child 1" parentId={parentId || undefined} />
          <TimeoutDisplay name="Child 2" parentId={parentId || undefined} />
        </div>
        <div>
          <h3 className="font-medium mb-2">Independent Timeouts</h3>
          <TimeoutDisplay name="Independent 1" />
          <TimeoutDisplay name="Independent 2" />
        </div>
      </div>
    </div>
  );
}
