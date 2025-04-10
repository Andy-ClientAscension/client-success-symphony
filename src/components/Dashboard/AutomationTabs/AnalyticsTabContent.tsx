
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsIntegration } from "@/components/Dashboard/AnalyticsIntegration";
import { InfoIcon } from "lucide-react";

export function AnalyticsTabContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnalyticsIntegration />
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium">Analytics Best Practices</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Focus on Key Metrics</h3>
                <p className="text-sm text-muted-foreground">
                  Identify 3-5 key metrics that align with your business goals and track them consistently.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Share with Clients</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom reports for clients showing the impact of your work on their business.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Fathom Analytics provides GDPR-compliant, cookie-free tracking that respects user privacy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
