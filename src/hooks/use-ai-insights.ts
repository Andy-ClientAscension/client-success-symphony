
import { useState, useEffect, useCallback } from 'react';
import { AIInsight, analyzeClientData, getStoredAIInsights } from '@/utils/aiDataAnalyzer';
import { Client } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

interface UseAIInsightsOptions {
  autoAnalyze?: boolean;
  refreshInterval?: number | null;
}

export function useAIInsights(clients: Client[], options: UseAIInsightsOptions = {}) {
  const { autoAnalyze = false, refreshInterval = null } = options;
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load stored insights on mount
  useEffect(() => {
    const storedInsights = getStoredAIInsights();
    if (storedInsights.length > 0) {
      setInsights(storedInsights);
    }
  }, []);

  // Auto-analyze if enabled
  useEffect(() => {
    if (autoAnalyze && clients.length > 0 && !isAnalyzing) {
      analyzeClients();
    }
  }, [autoAnalyze, clients]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      if (!isAnalyzing && clients.length > 0) {
        analyzeClients();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, isAnalyzing, clients]);

  const analyzeClients = useCallback(async (showToast = true) => {
    if (isAnalyzing || clients.length === 0) return;
    
    setIsAnalyzing(true);
    if (showToast) {
      toast({
        title: "Analyzing Client Data",
        description: "Our AI is analyzing your client data. This might take a moment.",
      });
    }
    
    try {
      const newInsights = await analyzeClientData(clients);
      setInsights(newInsights);
      setLastAnalyzed(new Date());
      
      if (showToast) {
        toast({
          title: "Analysis Complete",
          description: `Generated ${newInsights.length} insights from your client data.`,
        });
      }
      
      return newInsights;
    } catch (error) {
      console.error("Error analyzing clients:", error);
      
      if (showToast) {
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze client data. Please try again.",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [clients, isAnalyzing, toast]);

  const getInsightsByType = useCallback((type: AIInsight['type']) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const getInsightsBySeverity = useCallback((severity: AIInsight['severity']) => {
    return insights.filter(insight => insight.severity === severity);
  }, [insights]);

  return {
    insights,
    isAnalyzing,
    lastAnalyzed,
    analyzeClients,
    getInsightsByType,
    getInsightsBySeverity
  };
}
