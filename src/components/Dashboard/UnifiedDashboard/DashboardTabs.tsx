
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, LineChart, PieChart, BarChart2 } from "lucide-react";
import { TeamAnalytics } from "../TeamAnalytics";
import { ClientAnalytics } from "../ClientAnalytics";
import { DashboardOverview } from "./DashboardOverview";
import { AIInsightsTab } from "./AIInsightsTab";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  predictions: any[];
  insights: any[];
  isAnalyzing: boolean;
  comparisons: any[];
  handleRefreshData: () => void;
  trendData: any[];
}

export function DashboardTabs({
  activeTab,
  setActiveTab,
  predictions,
  insights,
  isAnalyzing,
  comparisons,
  handleRefreshData,
  trendData
}: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">
          <LineChart className="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="team-analytics">
          <PieChart className="h-4 w-4 mr-2" />
          Team Analytics
        </TabsTrigger>
        <TabsTrigger value="client-analytics">
          <BarChart2 className="h-4 w-4 mr-2" />
          Client Analytics
        </TabsTrigger>
        <TabsTrigger value="ai-insights">
          <Bot className="h-4 w-4 mr-2" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardOverview />
      </TabsContent>

      <TabsContent value="team-analytics">
        <TeamAnalytics />
      </TabsContent>

      <TabsContent value="client-analytics">
        <ClientAnalytics />
      </TabsContent>

      <TabsContent value="ai-insights">
        <AIInsightsTab 
          predictions={predictions}
          insights={insights}
          isAnalyzing={isAnalyzing}
          comparisons={comparisons}
          handleRefreshData={handleRefreshData}
          trendData={trendData}
        />
      </TabsContent>
    </Tabs>
  );
}
