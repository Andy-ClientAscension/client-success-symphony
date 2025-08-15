import { usePostNavigationData } from "@/hooks/use-post-navigation-data";
import { OptimizedRouteLoader } from "@/components/OptimizedRouteLoader";
import { LoadingState } from "@/components/LoadingState";
import { MOCK_CLIENTS } from "@/lib/data";

// Simulate API calls
const fetchClientsData = async () => {
  // Simulate variable network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 300));
  
  return {
    clients: MOCK_CLIENTS,
    totalCount: MOCK_CLIENTS.length,
    loadTime: Date.now()
  };
};

export default function OptimizedClients() {
  const {
    data: clientsData,
    isLoading,
    error,
    refresh,
    navigationComplete
  } = usePostNavigationData({
    fetcher: fetchClientsData,
    defaultValue: { clients: [], totalCount: 0, loadTime: 0 },
    immediate: true
  });

  return (
    <OptimizedRouteLoader>
      <div data-testid="clients-page" className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Immediate navigation - data loads progressively
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

        {/* Immediate content - no waiting for data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium text-sm text-muted-foreground">Route Status</h3>
            <p className="text-lg font-semibold">
              {navigationComplete ? 'Complete' : 'Transitioning'}
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium text-sm text-muted-foreground">Data Status</h3>
            <p className="text-lg font-semibold">
              {isLoading ? 'Loading' : error ? 'Error' : 'Ready'}
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium text-sm text-muted-foreground">Total Clients</h3>
            <p className="text-lg font-semibold">
              {isLoading ? '-' : clientsData.totalCount}
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
            <p className="text-sm">
              {clientsData.loadTime ? 
                new Date(clientsData.loadTime).toLocaleTimeString() : 
                'Not loaded'
              }
            </p>
          </div>
        </div>

        {/* Progressive data loading */}
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Client Directory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Navigation completed instantly - data loading in background
            </p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <LoadingState message="Fetching client data..." />
                <div className="grid gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Failed to load client data</p>
                <button 
                  onClick={refresh}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {clientsData.clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${client.mrr}/mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OptimizedRouteLoader>
  );
}