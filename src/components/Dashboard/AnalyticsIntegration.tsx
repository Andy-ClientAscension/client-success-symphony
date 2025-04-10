
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isApiConnected, apiIntegrations } from "@/lib/api";
import { APIConnectionDialog } from "./APIConnectionDialog";
import { BarChart2, LineChart, PieChart, RefreshCw } from "lucide-react";

export function AnalyticsIntegration() {
  const { toast } = useToast();
  const [siteId, setSiteId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const fathomConnected = isApiConnected("fathom");

  const handleFetchAnalytics = async () => {
    if (!siteId.trim()) {
      toast({
        title: "Missing Site ID",
        description: "Please enter a site ID to fetch analytics",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiIntegrations.fathom.getSiteStats(siteId);
      
      if (response.success && response.data) {
        setAnalyticsData(response.data);
        toast({
          title: "Analytics Fetched",
          description: "Successfully retrieved analytics data",
        });
      } else {
        throw new Error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Fetch Failed",
        description: "Failed to retrieve analytics data. Please check the site ID.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectService = () => {
    setApiDialogOpen(true);
  };

  if (!fathomConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fathom Analytics</CardTitle>
          <CardDescription>
            Connect to Fathom Analytics to view privacy-focused website statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectService}>Connect to Fathom</Button>
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
        <CardTitle>Fathom Analytics</CardTitle>
        <CardDescription>
          Privacy-focused website analytics for your clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="site-id">Site ID</Label>
          <div className="flex mt-2">
            <Input 
              id="site-id" 
              placeholder="Enter your Fathom site ID" 
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button 
              onClick={handleFetchAnalytics} 
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Fetch Data"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your Fathom site ID to fetch analytics data
          </p>
        </div>

        {analyticsData && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Analytics Overview</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                    Pageviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.pageviews.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-green-500" />
                    Unique Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.visitors.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-amber-500" />
                    Bounce Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.bounce_rate}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <LineChart className="h-4 w-4 mr-2 text-purple-500" />
                    Avg. Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.avg_duration}s</div>
                </CardContent>
              </Card>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => {
              toast({
                title: "Fetching Events",
                description: "Getting events data from Fathom...",
              });
              apiIntegrations.fathom.getEvents(siteId).then(response => {
                if (response.success) {
                  toast({
                    title: "Success",
                    description: "Events retrieved successfully",
                  });
                }
              });
            }}>
              Load Event Data
            </Button>
          </div>
        )}
        
        <APIConnectionDialog 
          open={apiDialogOpen} 
          onOpenChange={setApiDialogOpen} 
        />
      </CardContent>
    </Card>
  );
}
