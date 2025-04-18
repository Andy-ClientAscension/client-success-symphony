
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Clock } from "lucide-react";

interface GrowthRetentionSectionProps {
  growthRate: number;
  avgClientValue: number;
  clientLifetimeMonths: number;
  averageTimeToValue: number;
}

export function GrowthRetentionSection({ 
  growthRate, 
  avgClientValue, 
  clientLifetimeMonths, 
  averageTimeToValue 
}: GrowthRetentionSectionProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">Growth & Retention</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
            <div className="mr-3 p-2 rounded-md bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs font-medium">Growth Rate</div>
              <div className="text-sm font-semibold text-green-600">{growthRate}%</div>
            </div>
          </div>
          
          <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
            <div className="mr-3 p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-medium">Avg. Client Value</div>
              <div className="text-sm font-semibold">${avgClientValue}</div>
            </div>
          </div>
          
          <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
            <div className="mr-3 p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-medium">Client Lifetime</div>
              <div className="text-sm font-semibold">{clientLifetimeMonths} months</div>
            </div>
          </div>
          
          <div className="flex items-center p-2 rounded-lg border border-border/50 bg-card/50">
            <div className="mr-3 p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-medium">Time to Value</div>
              <div className="text-sm font-semibold">{averageTimeToValue} months</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
