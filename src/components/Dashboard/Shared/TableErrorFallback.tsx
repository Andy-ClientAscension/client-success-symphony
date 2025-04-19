
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function TableErrorFallback({ error, resetErrorBoundary }: TableErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-300">Table loading error</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetErrorBoundary}
            className="mt-3 text-red-700 hover:text-red-800 border-red-300 hover:border-red-400"
          >
            Retry Loading Table
          </Button>
        </div>
      </div>
    </div>
  );
}
