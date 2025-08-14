import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SSCCapacity } from '@/hooks/useSSCCapacities';

interface SSCCapacityCardProps {
  capacity: SSCCapacity;
}

export function SSCCapacityCard({ capacity }: SSCCapacityCardProps) {
  const getCapacityStatus = () => {
    if (capacity.capacity_percentage >= 93) { // 56/60 = 93.3%
      return { color: 'destructive', icon: AlertTriangle, label: 'At Capacity' };
    } else if (capacity.capacity_percentage >= 75) { // 45/60 = 75%
      return { color: 'warning', icon: Clock, label: 'Near Capacity' };
    }
    return { color: 'success', icon: CheckCircle, label: 'Good Capacity' };
  };

  const status = getCapacityStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {capacity.ssc_name}
            </CardTitle>
          </div>
          <Badge 
            variant={status.color as "default" | "secondary" | "destructive" | "outline"}
            className="flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Team: {capacity.team}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">
            {capacity.current_students}
          </span>
          <span className="text-sm text-muted-foreground">
            / {capacity.max_capacity} students
          </span>
        </div>
        
        <Progress 
          value={capacity.capacity_percentage} 
          className="h-2"
        />
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {capacity.available_capacity} spots available
          </span>
          <span className="font-medium">
            {capacity.capacity_percentage}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}