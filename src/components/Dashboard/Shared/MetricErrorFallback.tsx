
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MetricErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function MetricErrorFallback({ error, resetErrorBoundary }: MetricErrorFallbackProps) {
  return (
    <Card className="bg-red-50 dark:bg-red-900/20">
      <CardContent className="p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-300">Error loading metrics</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetErrorBoundary}
              className="mt-3 text-red-700 hover:text-red-800 border-red-300 hover:border-red-400"
            >
              Retry Loading Metrics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
