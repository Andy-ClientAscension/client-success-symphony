
import { useQuery } from "@tanstack/react-query";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ClientMetrics, UnifiedMetricsGrid, generateClientMetrics } from "./Metrics/UnifiedMetricsGrid";
import { EmptyState } from "@/components/EmptyState";

export function MetricsCards() {
  // Use React Query for data fetching with proper caching
  const { 
    data: clients = [],
    isLoading: isClientsLoading, 
    error: clientsError 
  } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: getAllClients,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  const { 
    data: clientCounts = { active: 0, "at-risk": 0, new: 0, churned: 0 },
    isLoading: isCountsLoading, 
    error: countsError 
  } = useQuery({
    queryKey: ['dashboard-client-counts'],
    queryFn: getClientsCountByStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  const { 
    data: churnData = [],
    isLoading: isChurnLoading, 
    error: churnError 
  } = useQuery({
    queryKey: ['dashboard-churn'],
    queryFn: getChurnData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  // Combine loading states
  const isLoading = isClientsLoading || isCountsLoading || isChurnLoading;
  
  // Combine errors
  const error = clientsError || countsError || churnError;

  if (isLoading) {
    return <MetricsLoadingSkeleton />;
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            title="Error Loading Metrics"
            message={error.message || "Failed to load dashboard metrics. Please try again."}
            action={{
              label: "Retry",
              onClick: () => {
                window.location.reload();
              }
            }}
          />
        </CardContent>
      </Card>
    );
  }
  
  // Check if we have actual data or just empty defaults
  const hasData = clients.length > 0 || 
    Object.values(clientCounts).some(count => count > 0) || 
    churnData.length > 0;
  
  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            title="No Metrics Available"
            message="There is no client data to display. Try adding some clients to see metrics."
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate the last churn rate from churn data
  const lastChurnRate = churnData.length > 0 ? churnData[churnData.length - 1].rate : 0;
  
  // Generate metrics data
  const metricsData: ClientMetrics = {
    total: clients.length,
    active: clientCounts.active,
    atRisk: clientCounts["at-risk"],
    newClients: clientCounts.new,
    churn: lastChurnRate,
    success: 100 - lastChurnRate,
    growthRate: 12 // Mock value for demo
  };
  
  const metrics = generateClientMetrics(metricsData);

  return <UnifiedMetricsGrid metrics={metrics} />;
}

function MetricsLoadingSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-5 w-[120px] mb-4" />
            <Skeleton className="h-8 w-[80px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
