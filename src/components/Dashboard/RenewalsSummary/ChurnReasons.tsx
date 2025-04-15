
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChurnReasonsProps {
  topChurnReasons: [string, number][];
}

export function ChurnReasons({ topChurnReasons }: ChurnReasonsProps) {
  if (topChurnReasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Churn Reasons</CardTitle>
          <CardDescription>No churn data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-muted-foreground">
            <p>No churn reasons have been recorded.</p>
            <p className="text-sm mt-2">When clients churn, record their reasons in the Backend Sales Tracker to see analysis here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate total churn count
  const totalChurn = topChurnReasons.reduce((sum, [_, count]) => sum + count, 0);
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Churn Reasons</CardTitle>
            <Badge variant="outline" className="ml-2">
              {totalChurn} total
            </Badge>
          </div>
          <CardDescription>Understanding why clients leave helps improve retention</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topChurnReasons.map(([reason, count], index) => {
              const percentage = Math.round((count / totalChurn) * 100);
              return (
                <li key={`top-reason-${index}`} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-1.5 h-10 rounded-full ${
                      index === 0 ? "bg-red-500" : 
                      index === 1 ? "bg-orange-500" : 
                      "bg-amber-500"
                    }`}></span>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="font-medium">{reason}</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <div className="text-xs">
                          <p className="font-medium">{percentage}% of total churn</p>
                          <p>{count} {count === 1 ? 'client' : 'clients'}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xs text-muted-foreground mr-2">{percentage}%</div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            <p className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Understanding these trends helps develop targeted retention strategies
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
