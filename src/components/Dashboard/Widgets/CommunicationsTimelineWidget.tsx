import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, Calendar } from 'lucide-react';
import { getCommunicationsWithDetails } from '@/lib/supabase-queries';
import { LoadingState } from '@/components/LoadingState';

interface Communication {
  id: string;
  client_id: string;
  type: string;
  subject: string;
  content: string;
  date: string;
  sent_by: string;
  sent_by_profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export function CommunicationsTimelineWidget() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      const data = await getCommunicationsWithDetails();
      setCommunications(data);
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatName = (profile?: { first_name?: string; last_name?: string; email: string }) => {
    if (!profile) return 'Unknown User';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email;
  };

  const groupByDate = (comms: Communication[]) => {
    const groups: { [key: string]: Communication[] } = {};
    
    comms.forEach(comm => {
      const date = new Date(comm.date).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(comm);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Communications Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading communications..." />
        </CardContent>
      </Card>
    );
  }

  const groupedCommunications = groupByDate(communications.slice(0, 20));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Communications Timeline
        </CardTitle>
        <CardDescription>
          Recent client communications and interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-xl font-bold text-blue-700">
              {communications.filter(c => c.type === 'email').length}
            </p>
            <p className="text-sm text-blue-900">Emails</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xl font-bold text-green-700">
              {communications.filter(c => c.type === 'phone').length}
            </p>
            <p className="text-sm text-green-900">Calls</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-xl font-bold text-purple-700">
              {communications.filter(c => c.type === 'meeting').length}
            </p>
            <p className="text-sm text-purple-900">Meetings</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {groupedCommunications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent communications</p>
          ) : (
            groupedCommunications.map(([date, comms]) => (
              <div key={date} className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                
                <div className="space-y-2">
                  {comms.map((comm) => (
                    <div key={comm.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-1 rounded ${getTypeColor(comm.type)}`}>
                          {getTypeIcon(comm.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium truncate">{comm.subject}</h5>
                          <Badge className={getTypeColor(comm.type)}>
                            {comm.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {comm.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Client: {comm.client_id.slice(0, 8)}</span>
                          <span>By: {formatName(comm.sent_by_profile)}</span>
                          <span>{new Date(comm.date).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}