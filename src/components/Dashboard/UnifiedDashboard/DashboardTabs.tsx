import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardOverview } from './DashboardOverview';
import { useToast } from '@/hooks/use-toast';

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  predictions: any[];
  insights: any[];
  isAnalyzing: boolean;
  error: Error | null;
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
  error,
  comparisons,
  handleRefreshData,
  trendData
}: DashboardTabsProps) {
  const { toast } = useToast();
  
  // When tab changes, inform screen readers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Using window.setTimeout to break out of the React event loop
    // This ensures the screen reader announcement happens after the UI updates
    window.setTimeout(() => {
      const tabNames: Record<string, string> = {
        'overview': 'Dashboard Overview',
        'analytics': 'Analytics',
        'insights': 'AI Insights',
        'predictions': 'Predictions'
      };
      
      // Announce the tab change to screen readers
      const announce = document.createElement('div');
      announce.setAttribute('aria-live', 'polite');
      announce.classList.add('sr-only');
      announce.innerText = `${tabNames[value] || value} tab selected`;
      document.body.appendChild(announce);
      
      // Remove the element after announcement
      setTimeout(() => document.body.removeChild(announce), 1000);
    }, 100);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="predictions">Predictions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" tabIndex={0}>
        <DashboardOverview />
      </TabsContent>
      
      <TabsContent value="analytics" tabIndex={0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analytics content would go here */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>
            {/* This would be populated with analytics charts/data */}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="insights" tabIndex={0}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">AI Generated Insights</h3>
          {isAnalyzing ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Analyzing your data...</span>
            </div>
          ) : insights && insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-md">
                  {/* Insight content would go here */}
                  <p>{insight.text || 'No insight description available'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p>No insights available. Request an analysis to generate insights.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="predictions" tabIndex={0}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Future Predictions</h3>
          {predictions && predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="p-4 border rounded-md">
                  {/* Prediction content would go here */}
                  <p>{prediction.text || 'No prediction description available'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p>No predictions available.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
