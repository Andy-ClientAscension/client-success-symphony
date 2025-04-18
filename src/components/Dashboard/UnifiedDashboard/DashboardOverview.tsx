
import { Card } from "@/components/ui/card";
import { MetricsCards } from "../MetricsCards";
import { AIInsightsWidget } from "../AIInsightsWidget";
import { NPSChart } from "../NPSChart";
import { getStoredAIInsights } from "@/utils/aiDataAnalyzer";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <MetricsCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="grid grid-cols-2 gap-6 p-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
              <div className="text-xl font-semibold text-green-600">12%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Avg. Client Value</div>
              <div className="text-xl font-semibold">$1200</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Client Lifetime</div>
              <div className="text-xl font-semibold">14.5 months</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Time to Value</div>
              <div className="text-xl font-semibold">3.2 months</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <NPSChart />
          </div>
        </Card>
      </div>
      
      <AIInsightsWidget insights={getStoredAIInsights()} />
    </div>
  );
}
