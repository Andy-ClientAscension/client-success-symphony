
import React from "react";
import { Cpu } from "lucide-react";

export function PerformanceAlert() {
  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-900/30">
      <div className="flex items-start">
        <Cpu className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-300">Performance Mode Active</h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Heavy components like the Client List and Kanban Board have been moved to the Clients page 
            to improve dashboard performance.
          </p>
        </div>
      </div>
    </div>
  );
}
