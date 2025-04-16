
import { useState, useEffect, useCallback } from 'react';
import { AIInsight, analyzeClientData, getStoredAIInsights } from '@/utils/aiDataAnalyzer';
import { Client } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

interface UseAIInsightsOptions {
  autoAnalyze?: boolean;
  refreshInterval?: number | null;
}

export interface ClientPrediction {
  id: string;
  name: string;
  churnRisk: number; // 0-100
  growthPotential: number; // 0-100
  recommendedAction: string;
  reason: string;
}

export function useAIInsights(clients: Client[], options: UseAIInsightsOptions = {}) {
  const { autoAnalyze = false, refreshInterval = null } = options;
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<ClientPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load stored insights on mount
  useEffect(() => {
    const storedInsights = getStoredAIInsights();
    if (storedInsights.length > 0) {
      setInsights(storedInsights);
    }
    
    // Generate initial predictions if we have clients
    if (clients.length > 0) {
      generatePredictions(clients);
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

  // Generate predictive analytics based on client data
  const generatePredictions = useCallback((clientList: Client[]) => {
    const newPredictions: ClientPrediction[] = clientList.map(client => {
      // Calculate churn risk (simplified algorithm)
      const npsRisk = client.npsScore ? Math.max(0, 10 - client.npsScore) * 10 : 50;
      const progressRisk = client.progress ? Math.max(0, 100 - client.progress) : 50;
      const churnRisk = Math.round((npsRisk * 0.7 + progressRisk * 0.3));
      
      // Calculate growth potential (simplified algorithm)
      const mrrPotential = client.mrr ? Math.min(100, client.mrr / 100) : 50;
      const dealsPotential = client.dealsClosed ? Math.min(100, client.dealsClosed * 20) : 30;
      const growthPotential = Math.round((mrrPotential * 0.6 + dealsPotential * 0.4));
      
      // Determine recommended action based on risk and potential
      let recommendedAction = '';
      let reason = '';
      
      if (churnRisk > 70) {
        recommendedAction = 'Immediate Outreach';
        reason = 'High churn risk detected';
      } else if (growthPotential > 70) {
        recommendedAction = 'Upsell Opportunity';
        reason = 'High growth potential identified';
      } else if (churnRisk > 40) {
        recommendedAction = 'Engagement Campaign';
        reason = 'Moderate churn risk detected';
      } else {
        recommendedAction = 'Maintain Relationship';
        reason = 'Client appears stable';
      }
      
      return {
        id: client.id,
        name: client.name,
        churnRisk,
        growthPotential,
        recommendedAction,
        reason
      };
    });
    
    setPredictions(newPredictions);
  }, []);

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
      generatePredictions(clients);
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
  }, [clients, isAnalyzing, toast, generatePredictions]);

  const getInsightsByType = useCallback((type: AIInsight['type']) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const getInsightsBySeverity = useCallback((severity: AIInsight['severity']) => {
    return insights.filter(insight => insight.severity === severity);
  }, [insights]);

  const getHighRiskClients = useCallback(() => {
    return predictions.filter(prediction => prediction.churnRisk > 70);
  }, [predictions]);

  const getHighGrowthClients = useCallback(() => {
    return predictions.filter(prediction => prediction.growthPotential > 70);
  }, [predictions]);

  return {
    insights,
    predictions,
    isAnalyzing,
    lastAnalyzed,
    analyzeClients,
    getInsightsByType,
    getInsightsBySeverity,
    getHighRiskClients,
    getHighGrowthClients
  };
}
