
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsIntegration } from "@/components/Dashboard/AnalyticsIntegration";
import { InfoIcon, BarChart2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AnalyticsTabContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnalyticsIntegration />
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
              Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              View comprehensive client data analytics and performance metrics to make data-driven decisions.
            </p>
            <Button asChild className="w-full">
              <Link to="/analytics" className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Open Analytics Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      
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
    </div>
  );
}
