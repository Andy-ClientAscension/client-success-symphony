import { usePostNavigationData } from "@/hooks/use-post-navigation-data";
import { OptimizedRouteLoader } from "@/components/OptimizedRouteLoader";
import { LoadingState } from "@/components/LoadingState";
import { MOCK_CLIENTS } from "@/lib/data";

// Simulate API calls
const fetchDashboardData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  return {
    clients: MOCK_CLIENTS,
    analytics: { totalRevenue: 125000, activeClients: MOCK_CLIENTS.length },
    loadTime: Date.now()
  };
};

export default function OptimizedDashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refresh,
    navigationComplete
  } = usePostNavigationData({
    fetcher: fetchDashboardData,
    defaultValue: { clients: [], analytics: null, loadTime: 0 },
    immediate: true
  });

  return (
    <OptimizedRouteLoader>
      <div data-testid="dashboard-content" className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Navigate first, load data after - no blocking on network latency
            </p>
          </div>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Show immediate content without waiting for data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Navigation Status</h3>
            <p className="text-sm text-muted-foreground">
              ✅ Route loaded instantly
            </p>
            <p className="text-sm text-muted-foreground">
              {navigationComplete ? '✅' : '⏳'} Navigation complete
            </p>
            <p className="text-sm text-muted-foreground">
              {isLoading ? '⏳' : '✅'} Data {isLoading ? 'loading' : 'loaded'}
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Clients</h3>
            {isLoading ? (
              <LoadingState message="Loading client data..." />
            ) : error ? (
              <p className="text-destructive">Error loading clients</p>
            ) : (
              <p className="text-2xl font-bold">{dashboardData.clients.length}</p>
            )}
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">Load Time</h3>
            {dashboardData.loadTime ? (
              <p className="text-sm text-muted-foreground">
                Data loaded at {new Date(dashboardData.loadTime).toLocaleTimeString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>

        {/* Progressive content loading */}
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-4">Client List</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive">Failed to load client data</p>
          ) : (
            <div className="space-y-2">
              {dashboardData.clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex justify-between p-3 bg-muted rounded">
                  <span>{client.name}</span>
                  <span className="text-muted-foreground">{client.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OptimizedRouteLoader>
  );
}