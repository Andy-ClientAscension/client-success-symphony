
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, PieChart } from "lucide-react";

interface StatisticsCardsProps {
  renewedClients: number;
  churnedClients: number;
  renewalRate: number;
}

export function StatisticsCards({ renewedClients, churnedClients, renewalRate }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-lg font-semibold">{renewedClients}</p>
            <p className="text-sm text-muted-foreground">Renewed Clients</p>
          </div>
        </CardContent>
      </Card>
          
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-lg font-semibold">{churnedClients}</p>
            <p className="text-sm text-muted-foreground">Churned Clients</p>
          </div>
        </CardContent>
      </Card>
          
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <PieChart className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-lg font-semibold">{renewalRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Renewal Rate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
