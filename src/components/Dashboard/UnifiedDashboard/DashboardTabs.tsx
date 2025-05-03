
import React, { useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardOverview } from './DashboardOverview';
import { useToast } from '@/hooks/use-toast';
import { announceToScreenReader } from '@/lib/accessibility';

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
  const prevTabRef = useRef<string>(activeTab);
  
  // Handle keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + number keys for tab switching
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 4) {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabValues = ['overview', 'analytics', 'insights', 'predictions'];
        if (tabIndex < tabValues.length) {
          setActiveTab(tabValues[tabIndex]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);
  
  // Announce tab changes to screen readers
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      const tabNames: Record<string, string> = {
        'overview': 'Dashboard Overview',
        'analytics': 'Analytics',
        'insights': 'AI Insights',
        'predictions': 'Predictions'
      };
      
      announceToScreenReader(`${tabNames[activeTab] || activeTab} tab selected`, 'polite');
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);
  
  // When tab changes, inform screen readers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
      aria-label="Dashboard Sections"
    >
      <div className="sr-only" aria-live="polite">
        Use Alt+1 through Alt+4 to navigate between tabs
      </div>
      
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger 
          value="overview"
          aria-controls="panel-overview"
          aria-label="Overview Tab (Alt+1)"
          data-keyboard-shortcut="Alt+1"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="analytics"
          aria-controls="panel-analytics"
          aria-label="Analytics Tab (Alt+2)"
          data-keyboard-shortcut="Alt+2"
        >
          Analytics
        </TabsTrigger>
        <TabsTrigger 
          value="insights"
          aria-controls="panel-insights"
          aria-label="AI Insights Tab (Alt+3)"
          data-keyboard-shortcut="Alt+3"
        >
          AI Insights
        </TabsTrigger>
        <TabsTrigger 
          value="predictions"
          aria-controls="panel-predictions"
          aria-label="Predictions Tab (Alt+4)"
          data-keyboard-shortcut="Alt+4"
        >
          Predictions
        </TabsTrigger>
      </TabsList>
      
      <TabsContent id="panel-overview" value="overview" tabIndex={0}>
        <DashboardOverview />
      </TabsContent>
      
      <TabsContent id="panel-analytics" value="analytics" tabIndex={0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analytics content would go here */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>
            {/* This would be populated with analytics charts/data */}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent id="panel-insights" value="insights" tabIndex={0}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">AI Generated Insights</h3>
          {isAnalyzing ? (
            <div 
              className="flex items-center justify-center p-12"
              role="status"
              aria-live="polite"
            >
              <div 
                className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
                aria-hidden="true"
              ></div>
              <span className="ml-3">Analyzing your data...</span>
            </div>
          ) : insights && insights.length > 0 ? (
            <div 
              className="space-y-4"
              role="list"
              aria-label="AI Insights list"
            >
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-md"
                  role="listitem"
                >
                  {/* Insight content would go here */}
                  <p>{insight.text || 'No insight description available'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-12"
              aria-live="polite"
            >
              <p>No insights available. Request an analysis to generate insights.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent id="panel-predictions" value="predictions" tabIndex={0}>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Future Predictions</h3>
          {predictions && predictions.length > 0 ? (
            <div 
              className="space-y-4"
              role="list"
              aria-label="Predictions list"
            >
              {predictions.map((prediction, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-md"
                  role="listitem"
                >
                  {/* Prediction content would go here */}
                  <p>{prediction.text || 'No prediction description available'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-12"
              aria-live="polite"
            >
              <p>No predictions available.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
