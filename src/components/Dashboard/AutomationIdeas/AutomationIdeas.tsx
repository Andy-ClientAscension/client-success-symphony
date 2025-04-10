
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

// Define the automation idea type
export interface AutomationIdea {
  title: string;
  description: string;
}

// Define a larger collection of automation ideas
export const allAutomationIdeas = [
  {
    title: "Client Onboarding",
    description: "Automatically send welcome emails, schedule kickoff calls, and create tasks when a new client is added."
  },
  {
    title: "Payment Reminders",
    description: "Automatically send email reminders when client payments are due or overdue."
  },
  {
    title: "Health Score Alerts",
    description: "Get notified when client health scores drop below a certain threshold."
  },
  {
    title: "Weekly Client Reports",
    description: "Generate and send weekly progress reports to clients automatically."
  },
  {
    title: "Content Workflow",
    description: "Automate content creation workflows from ideation to publication and analytics."
  },
  {
    title: "Meeting Followups",
    description: "Send meeting notes and action items automatically after client calls."
  },
  {
    title: "NPS Survey Automation",
    description: "Send NPS surveys to clients at key milestones and track responses over time."
  },
  {
    title: "Client Anniversary",
    description: "Send personalized messages on client anniversaries and important dates."
  },
  {
    title: "Document Approvals",
    description: "Create automated approval workflows for client documents and deliverables."
  }
];

export function AutomationIdeas() {
  const [displayedIdeas, setDisplayedIdeas] = useState<AutomationIdea[]>([]);
  
  // Initialize with 3 random ideas
  useEffect(() => {
    rotateAutomationIdeas();
    
    // Rotate ideas every 3 minutes
    const rotationInterval = setInterval(rotateAutomationIdeas, 3 * 60 * 1000);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // Function to select 3 random ideas from the full list
  const rotateAutomationIdeas = () => {
    // Shuffle array and pick first 3
    const shuffled = [...allAutomationIdeas].sort(() => 0.5 - Math.random());
    setDisplayedIdeas(shuffled.slice(0, 3));
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium">Automation Ideas</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={rotateAutomationIdeas}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              Show New Ideas
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedIdeas.map((idea, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {idea.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
