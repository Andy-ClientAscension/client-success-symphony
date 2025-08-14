import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { useSSCCapacities } from '@/hooks/useSSCCapacities';
import { SSCCapacityCard } from './SSCCapacityCard';
import { useState } from 'react';

export function SSCCapacityDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const { capacities, loading, error, refetch } = useSSCCapacities(
    selectedTeam === 'all' ? undefined : selectedTeam
  );

  // Get unique teams
  const teams = Array.from(new Set(capacities.map(c => c.team)));

  // Calculate summary metrics
  const totalSSCs = capacities.length;
  const atCapacity = capacities.filter(c => c.capacity_percentage >= 93).length;
  const nearCapacity = capacities.filter(c => c.capacity_percentage >= 75 && c.capacity_percentage < 93).length;
  const totalStudents = capacities.reduce((sum, c) => sum + c.current_students, 0);
  const totalCapacity = capacities.reduce((sum, c) => sum + c.max_capacity, 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">SSC Capacity Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">SSC Capacity Dashboard</h2>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Error loading capacity data: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">SSC Capacity Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total SSCs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSSCs}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              At/Near Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atCapacity + nearCapacity}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="destructive" className="text-xs">
                {atCapacity} at capacity
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {nearCapacity} near
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents} / {totalCapacity} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Available Spots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity - totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual SSC Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Individual SSC Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {capacities.map(capacity => (
            <SSCCapacityCard key={capacity.id} capacity={capacity} />
          ))}
        </div>
      </div>

      {capacities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No SSC capacity data found. 
              {selectedTeam !== 'all' && (
                <span> Try selecting a different team or "All Teams".</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}