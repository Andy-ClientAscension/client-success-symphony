
import { useState, useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Client, getAllClients } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export function UpcomingRenewals() {
  const [upcomingRenewals, setUpcomingRenewals] = useState<Client[]>([]);
  const navigate = useNavigate();
  
  // Find the next 5 students due for renewal
  useEffect(() => {
    const clients = getAllClients();
    const today = new Date();
    
    const renewals = clients
      .filter(client => {
        const endDate = new Date(client.endDate);
        const daysRemaining = differenceInDays(endDate, today);
        return daysRemaining >= 0; // Only upcoming renewals
      })
      .sort((a, b) => {
        // Sort by the closest renewal date
        return differenceInDays(new Date(a.endDate), today) - 
               differenceInDays(new Date(b.endDate), today);
      })
      .slice(0, 5); // Only take the first 5
    
    setUpcomingRenewals(renewals);
  }, []);
  
  const handleViewClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };
  
  return (
    <Card className="h-auto mb-6">
      <CardHeader className="flex flex-row justify-between items-center p-2 border-b">
        <CardTitle className="text-sm flex items-center font-medium">
          <CalendarClock className="h-4 w-4 mr-1 text-blue-600" />
          Upcoming Renewals
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/renewals')}
          className="h-6 text-xs px-2 py-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[150px]">
          {upcomingRenewals.length > 0 ? (
            <div className="space-y-1">
              {upcomingRenewals.map((client) => {
                const daysRemaining = differenceInDays(new Date(client.endDate), new Date());
                return (
                  <div key={client.id} className="flex justify-between items-center p-1.5 mb-1 border-b">
                    <div className="flex items-center">
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {client.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={daysRemaining <= 7 ? "destructive" : daysRemaining <= 30 ? "outline" : "secondary"}
                        className="text-xs px-1.5 py-0"
                      >
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewClient(client.id)}
                        className="h-6 w-6 p-0"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground">
              <p>No upcoming renewals</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
