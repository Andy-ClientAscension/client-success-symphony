
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Check, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Users,
  FileText,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  clientId: string;
  type: 'message' | 'call' | 'email' | 'status_change' | 'meeting' | 'team_change' | 'note' | 'metric_update';
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  clientId?: string; // Optional client ID to filter activities
  limit?: number; // Optional limit to number of activities shown
  showTitle?: boolean; // Whether to show the card title
}

export function ClientActivityLog({ clientId, limit = 10, showTitle = true }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulating fetching activities
    const mockActivities: Activity[] = [
      {
        id: "a1",
        clientId: "client1",
        type: "call",
        description: "Quarterly review call",
        timestamp: new Date(2023, 8, 15, 10, 30).toISOString(),
        user: "Andy Smith"
      },
      {
        id: "a2",
        clientId: "client2",
        type: "status_change",
        description: "Status changed from Active to At Risk",
        timestamp: new Date(2023, 8, 14, 15, 45).toISOString(),
        user: "Chris Johnson",
        metadata: {
          oldStatus: "active",
          newStatus: "at-risk"
        }
      },
      {
        id: "a3",
        clientId: "client1",
        type: "team_change",
        description: "Assigned to Team-Andy",
        timestamp: new Date(2023, 8, 13, 9, 15).toISOString(),
        user: "Alex Wilson",
        metadata: {
          team: "Team-Andy"
        }
      },
      {
        id: "a4",
        clientId: "client3",
        type: "meeting",
        description: "Onboarding session scheduled",
        timestamp: new Date(2023, 8, 20, 11, 0).toISOString(),
        user: "Cillin O'Connell",
        metadata: {
          meetingDate: new Date(2023, 8, 25, 14, 0).toISOString()
        }
      },
      {
        id: "a5",
        clientId: "client2",
        type: "note",
        description: "Client expressed concerns about support response time",
        timestamp: new Date(2023, 8, 12, 16, 30).toISOString(),
        user: "Chris Johnson"
      },
      {
        id: "a6",
        clientId: "client1",
        type: "email",
        description: "Sent follow-up about new features",
        timestamp: new Date(2023, 8, 11, 14, 20).toISOString(),
        user: "Andy Smith"
      },
      {
        id: "a7",
        clientId: "client3",
        type: "metric_update",
        description: "Updated MRR to $5,000",
        timestamp: new Date(2023, 8, 10, 10, 45).toISOString(),
        user: "Alex Wilson",
        metadata: {
          oldMRR: 3000,
          newMRR: 5000
        }
      },
      {
        id: "a8",
        clientId: "client2",
        type: "message",
        description: "Chat conversation about API usage",
        timestamp: new Date(2023, 8, 9, 11, 15).toISOString(),
        user: "Cillin O'Connell"
      },
      {
        id: "a9",
        clientId: "client1",
        type: "status_change",
        description: "Status changed from New to Active",
        timestamp: new Date(2023, 8, 8, 9, 0).toISOString(),
        user: "Chris Johnson",
        metadata: {
          oldStatus: "new",
          newStatus: "active"
        }
      },
      {
        id: "a10",
        clientId: "client3",
        type: "call",
        description: "Product feedback call",
        timestamp: new Date(2023, 8, 7, 15, 30).toISOString(),
        user: "Andy Smith"
      },
    ];
    
    // Filter by client ID if provided
    const filtered = clientId 
      ? mockActivities.filter(a => a.clientId === clientId)
      : mockActivities;
    
    // Sort by timestamp (newest first)
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply limit if needed
    const limited = limit > 0 ? sorted.slice(0, limit) : sorted;
    
    setActivities(limited);
  }, [clientId, limit]);
  
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'status_change': return <AlertTriangle className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'team_change': return <Users className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'metric_update': return <BarChart className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'message': return "bg-blue-100 text-blue-800";
      case 'call': return "bg-green-100 text-green-800";
      case 'email': return "bg-purple-100 text-purple-800";
      case 'status_change': return "bg-amber-100 text-amber-800";
      case 'meeting': return "bg-indigo-100 text-indigo-800";
      case 'team_change': return "bg-pink-100 text-pink-800";
      case 'note': return "bg-slate-100 text-slate-800";
      case 'metric_update': return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-1">
                  <div className={`p-2 rounded-full ${getActivityBadge(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between">
                    <span className="font-medium">{activity.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                  {activity.type === 'status_change' && activity.metadata && (
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">{activity.metadata.oldStatus}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{activity.metadata.newStatus}</Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!clientId && (
              <Button variant="link" className="w-full mt-2">
                View All Activities
              </Button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No activities recorded
          </div>
        )}
      </CardContent>
    </Card>
  );
}
