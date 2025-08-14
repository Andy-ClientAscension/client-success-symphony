import { useState, useEffect, useCallback } from 'react';
import { realtimeAIProcessor, AnomalyDetection, RealTimeInsight } from '@/services/ai/realtime-ai-processor';
import { Client } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';

interface UseRealtimeAIOptions {
  enableAnomalyDetection?: boolean;
  enableInsightGeneration?: boolean;
  alertThreshold?: 'low' | 'medium' | 'high' | 'critical';
  processingInterval?: number; // milliseconds
}

export function useRealtimeAI(
  clients: Client[],
  options: UseRealtimeAIOptions = {}
) {
  const { toast } = useToast();
  const {
    enableAnomalyDetection = true,
    enableInsightGeneration = true,
    alertThreshold = 'medium',
    processingInterval = 30000 // 30 seconds
  } = options;

  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [insights, setInsights] = useState<RealTimeInsight[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);
  const [alertCount, setAlertCount] = useState(0);

  // Process data manually
  const processData = useCallback(async () => {
    if (!clients.length || isProcessing) return;

    setIsProcessing(true);
    try {
      const results = await realtimeAIProcessor.processRealtimeData(clients);
      
      // Update state
      setAnomalies(results.anomalies);
      setInsights(results.insights);
      setLastProcessed(new Date());

      // Count new critical alerts
      const criticalAnomalies = results.anomalies.filter(a => 
        a.severity === 'critical' || (alertThreshold !== 'critical' && a.severity === 'high')
      );

      if (criticalAnomalies.length > 0) {
        setAlertCount(prev => prev + criticalAnomalies.length);
        
        // Show toast for high-priority alerts
        criticalAnomalies.slice(0, 3).forEach(anomaly => {
          toast({
            title: `🚨 ${anomaly.anomalyType.replace('_', ' ').toUpperCase()}`,
            description: `${anomaly.clientName}: ${anomaly.description}`,
            variant: "destructive"
          });
        });
      }

      // Show insights toast
      if (results.insights.length > 0) {
        const highImpactInsights = results.insights.filter(i => i.impact === 'high');
        if (highImpactInsights.length > 0) {
          toast({
            title: "💡 New AI Insights Available",
            description: `${highImpactInsights.length} high-impact insights generated from real-time data.`,
          });
        }
      }

    } catch (error) {
      console.error('Error processing real-time AI data:', error);
      toast({
        title: "AI Processing Error",
        description: "Failed to analyze real-time data. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [clients, isProcessing, alertThreshold, toast]);

  // Auto-processing effect
  useEffect(() => {
    if (!enableAnomalyDetection && !enableInsightGeneration) return;

    // Load stored data on mount
    setAnomalies(realtimeAIProcessor.getStoredAnomalies());
    setInsights(realtimeAIProcessor.getStoredInsights());

    // Initial processing
    processData();

    // Set up interval processing
    const interval = setInterval(processData, processingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [processData, enableAnomalyDetection, enableInsightGeneration, processingInterval]);

  // Filter functions
  const getAnomaliesBySeverity = useCallback((severity: AnomalyDetection['severity']) => {
    return anomalies.filter(a => a.severity === severity);
  }, [anomalies]);

  const getInsightsByType = useCallback((type: RealTimeInsight['type']) => {
    return insights.filter(i => i.type === type);
  }, [insights]);

  const getInsightsByImpact = useCallback((impact: RealTimeInsight['impact']) => {
    return insights.filter(i => i.impact === impact);
  }, [insights]);

  const getCriticalAlerts = useCallback(() => {
    return anomalies.filter(a => a.severity === 'critical' || a.severity === 'high');
  }, [anomalies]);

  const getRecentInsights = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return insights.filter(i => new Date(i.createdAt) > cutoff);
  }, [insights]);

  // Clear alert count
  const clearAlerts = useCallback(() => {
    setAlertCount(0);
  }, []);

  return {
    // Data
    anomalies,
    insights,
    
    // Status
    isProcessing,
    lastProcessed,
    alertCount,
    
    // Actions
    processData,
    clearAlerts,
    
    // Filters
    getAnomaliesBySeverity,
    getInsightsByType,
    getInsightsByImpact,
    getCriticalAlerts,
    getRecentInsights,
    
    // Statistics
    stats: {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
      highPriorityInsights: insights.filter(i => i.impact === 'high').length,
      averageConfidence: insights.length > 0 
        ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
        : 0
    }
  };
}