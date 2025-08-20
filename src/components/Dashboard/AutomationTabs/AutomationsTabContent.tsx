
import { Card, CardContent } from "@/components/ui/card";
import { AutomationManager } from "@/components/Dashboard/AutomationManager";
import { AutomationIdeas } from "@/components/Dashboard/AutomationIdeas";

export function AutomationsTabContent() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="min-h-[200px]">
        <CardContent className="p-6">
          <AutomationManager />
        </CardContent>
      </Card>
      
      <AutomationIdeas />
    </div>
  );
}
