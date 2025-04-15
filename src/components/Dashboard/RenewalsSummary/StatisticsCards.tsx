
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, PieChart, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatisticsCardsProps {
  renewedClients: number;
  churnedClients: number;
  renewalRate: number;
}

export function StatisticsCards({ renewedClients, churnedClients, renewalRate }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TooltipProvider>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-lg font-semibold">{renewedClients}</p>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">Renewed Clients</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Total number of clients who renewed their contracts in the current period
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
            
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-lg font-semibold">{churnedClients}</p>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">Churned Clients</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Total number of clients who did not renew and ended their relationship in the current period
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
            
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <PieChart className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-lg font-semibold">{renewalRate.toFixed(1)}%</p>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">Renewal Rate</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Percentage of clients who renewed out of all clients eligible for renewal. 
                      Calculated as: (Renewed Clients ÷ Total Eligible) × 100
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}
