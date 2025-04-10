
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isApiConnected, apiIntegrations } from "@/lib/api";
import { APIConnectionDialog } from "./APIConnectionDialog";
import { Calendar, ExternalLink, RefreshCw } from "lucide-react";

export function CalendlyIntegration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [schedulingLinks, setSchedulingLinks] = useState<any[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const calendlyConnected = isApiConnected("calendly");

  const handleFetchSchedulingLinks = async () => {
    setIsLoading(true);

    try {
      const response = await apiIntegrations.calendly.getSchedulingLinks();
      
      if (response.success && response.data) {
        // In a real implementation, this would populate with actual data
        // For this demo, we'll create some sample links
        setSchedulingLinks([
          { id: 1, name: "30 Minute Meeting", url: "https://calendly.com/example/30min" },
          { id: 2, name: "60 Minute Consultation", url: "https://calendly.com/example/60min" },
          { id: 3, name: "15 Minute Quick Chat", url: "https://calendly.com/example/15min" }
        ]);
        
        toast({
          title: "Links Fetched",
          description: "Successfully retrieved Calendly scheduling links",
        });
      } else {
        throw new Error("Failed to fetch scheduling links");
      }
    } catch (error) {
      console.error("Error fetching scheduling links:", error);
      toast({
        title: "Fetch Failed",
        description: "Failed to retrieve scheduling links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchEvents = async () => {
    setIsLoading(true);

    try {
      const response = await apiIntegrations.calendly.getEvents();
      
      if (response.success) {
        setEventsLoaded(true);
        toast({
          title: "Events Fetched",
          description: "Successfully retrieved Calendly events",
        });
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Fetch Failed",
        description: "Failed to retrieve events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectService = () => {
    setApiDialogOpen(true);
  };

  if (!calendlyConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Calendly
          </CardTitle>
          <CardDescription>
            Connect to Calendly to manage appointments and scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectService}>Connect to Calendly</Button>
          <APIConnectionDialog 
            open={apiDialogOpen} 
            onOpenChange={setApiDialogOpen} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Calendly
        </CardTitle>
        <CardDescription>
          Manage appointments and scheduling for your clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={handleFetchSchedulingLinks} 
            disabled={isLoading || schedulingLinks.length > 0}
            className="flex-1"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Get Scheduling Links
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleFetchEvents} 
            disabled={isLoading || eventsLoaded}
            className="flex-1"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Fetch Events
          </Button>
        </div>

        {schedulingLinks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Your Scheduling Links</h3>
            <div className="space-y-2">
              {schedulingLinks.map(link => (
                <Card key={link.id}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{link.name}</div>
                      <div className="text-sm text-muted-foreground">{link.url}</div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button className="w-full" onClick={() => {
              const embed = `<div class="calendly-inline-widget" data-url="https://calendly.com/example" style="min-width:320px;height:630px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>`;
              
              navigator.clipboard.writeText(embed);
              
              toast({
                title: "Code Copied",
                description: "Embed code copied to clipboard",
              });
            }}>
              Copy Embed Code
            </Button>
          </div>
        )}
        
        {eventsLoaded && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                No upcoming events scheduled
              </div>
            </CardContent>
          </Card>
        )}
        
        <APIConnectionDialog 
          open={apiDialogOpen} 
          onOpenChange={setApiDialogOpen} 
        />
      </CardContent>
    </Card>
  );
}
