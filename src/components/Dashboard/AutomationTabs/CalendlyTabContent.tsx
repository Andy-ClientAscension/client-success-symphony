
import { Card, CardContent } from "@/components/ui/card";
import { CalendlyIntegration } from "@/components/Dashboard/CalendlyIntegration";
import { InfoIcon } from "lucide-react";

export function CalendlyTabContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CalendlyIntegration />
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium">Scheduling Tips</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Embed on Client Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Embed your Calendly scheduling page on your client portal for easy appointment booking.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Customize Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Set dedicated hours for client meetings to maintain a productive schedule.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Add Buffer Time</h3>
                <p className="text-sm text-muted-foreground">
                  Include buffer time between meetings to prepare for the next client.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
