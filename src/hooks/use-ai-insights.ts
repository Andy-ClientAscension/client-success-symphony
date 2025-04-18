
import { useState, useEffect, useCallback, useRef } from 'react';
import { AIInsight, analyzeClientData, getStoredAIInsights } from '@/utils/aiDataAnalyzer';
import { Client } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

interface UseAIInsightsOptions {
  autoAnalyze?: boolean;
  refreshInterval?: number | null;
  silentMode?: boolean; // New option to control toast notifications
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
  const { autoAnalyze = false, refreshInterval = null, silentMode = false } = options;
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<ClientPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const analysisAbortController = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Use a ref to track whether the component is mounted
  const isMounted = useRef(true);

  // Track in-flight analysis to prevent duplicates
  const analysisInProgress = useRef(false);

  // Load stored insights on mount
  useEffect(() => {
    try {
      const storedInsights = getStoredAIInsights();
      if (storedInsights.length > 0) {
        setInsights(storedInsights);
      }
      
      // Generate initial predictions if we have clients
      if (clients.length > 0) {
        generatePredictions(clients);
      }
    } catch (err) {
      console.error("Error loading initial insights:", err);
      setError(err instanceof Error ? err : new Error("Failed to load initial insights"));
    }
    
    // Set up cleanup function
    return () => {
      isMounted.current = false;
      
      // Cancel any in-progress analysis
      if (analysisAbortController.current) {
        analysisAbortController.current.abort();
      }
    };
  }, []);

  // Auto-analyze if enabled
  useEffect(() => {
    if (autoAnalyze && clients.length > 0 && !isAnalyzing && !analysisInProgress.current) {
      analyzeClients(false); // Use silent mode for auto-analysis
    }
  }, [autoAnalyze, clients]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      if (!isAnalyzing && clients.length > 0 && !analysisInProgress.current) {
        analyzeClients(false); // Use silent mode for scheduled analysis
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, isAnalyzing, clients]);

  // Generate predictive analytics based on client data
  const generatePredictions = useCallback((clientList: Client[]) => {
    try {
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
    } catch (err) {
      console.error("Error generating predictions:", err);
      // Don't update state if component unmounted
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Failed to generate predictions"));
      }
    }
  }, []);

  const analyzeClients = useCallback(async (showToast = true) => {
    // Don't proceed if already analyzing or no clients
    if (isAnalyzing || analysisInProgress.current || clients.length === 0) return null;
    
    // Clear any previous errors
    setError(null);
    
    // Create new abort controller for this analysis
    analysisAbortController.current = new AbortController();
    
    analysisInProgress.current = true;
    setIsAnalyzing(true);
    setStatus('loading');
    
    if (showToast && !silentMode) {
      toast({
        title: "Analyzing Client Data",
        description: "Our AI is analyzing your client data. This might take a moment.",
      });
    }
    
    try {
      // Pass the signal to the analysis function
      const signal = analysisAbortController.current.signal;
      const newInsights = await analyzeClientData(clients, signal);
      
      // Don't update state if component unmounted or analysis canceled
      if (!isMounted.current || signal.aborted) {
        return null;
      }
      
      setInsights(newInsights);
      generatePredictions(clients);
      setLastAnalyzed(new Date());
      setStatus('success');
      
      if (showToast && !silentMode) {
        toast({
          title: "Analysis Complete",
          description: `Generated ${newInsights.length} insights from your client data.`,
        });
      }
      
      return newInsights;
    } catch (error) {
      // Only handle error if not aborted and component still mounted
      if (isMounted.current && (!analysisAbortController.current || !analysisAbortController.current.signal.aborted)) {
        console.error("Error analyzing clients:", error);
        setError(error instanceof Error ? error : new Error("Unknown analysis error"));
        setStatus('error');
        
        if (showToast && !silentMode) {
          toast({
            title: "Analysis Failed",
            description: "Failed to analyze client data. The system will retry automatically.",
            variant: "destructive",
          });
        }
      }
      
      return null;
    } finally {
      // Make sure to reset state if component still mounted
      if (isMounted.current) {
        setIsAnalyzing(false);
        analysisInProgress.current = false;
        analysisAbortController.current = null;
      }
    }
  }, [clients, isAnalyzing, silentMode, toast, generatePredictions]);

  const cancelAnalysis = useCallback(() => {
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
      analysisAbortController.current = null;
    }
    
    // Reset state
    if (isMounted.current) {
      setIsAnalyzing(false);
      analysisInProgress.current = false;
      setStatus('idle');
    }
    
    if (!silentMode) {
      toast({
        title: "Analysis Canceled",
        description: "Client data analysis has been canceled.",
      });
    }
  }, [silentMode, toast]);

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
    error,
    status,
    analyzeClients,
    cancelAnalysis,
    getInsightsByType,
    getInsightsBySeverity,
    getHighRiskClients,
    getHighGrowthClients
  };
}
