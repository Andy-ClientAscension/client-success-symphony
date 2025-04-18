
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Home } from "lucide-react";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
}

export function DashboardHeader({ isRefreshing, handleRefreshData }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-xl font-bold">Unified Dashboard</h2>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="h-8 gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        
        <Button asChild variant="destructive" className="text-white bg-red-600 hover:bg-red-700 h-8 gap-1">
          <Link to="/">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
