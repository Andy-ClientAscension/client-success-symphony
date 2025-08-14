import { supabase } from '@/integrations/supabase/client';
import { generateAIResponse, OpenAIMessage } from '@/lib/openai';
import { Client } from '@/lib/data';

export interface AnomalyDetection {
  id: string;
  clientId: string;
  clientName: string;
  anomalyType: 'revenue_drop' | 'engagement_decline' | 'payment_delay' | 'nps_drop' | 'churn_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: Date;
  suggestedAction: string;
  relatedMetrics: Record<string, any>;
}

export interface RealTimeInsight {
  id: string;
  type: 'trend' | 'alert' | 'opportunity' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  createdAt: Date;
  affectedClients: string[];
  data: Record<string, any>;
}

class RealTimeAIProcessor {
  private lastProcessedTimestamp: Date = new Date();
  private readonly ANOMALY_THRESHOLDS = {
    revenue_drop: 0.15, // 15% drop
    engagement_decline: 0.20, // 20% decline
    nps_drop: 10, // 10 point drop
    payment_delay: 7, // 7 days late
  };

  async processRealtimeData(clients: Client[]): Promise<{
    anomalies: AnomalyDetection[];
    insights: RealTimeInsight[];
  }> {
    try {
      const anomalies = await this.detectAnomalies(clients);
      const insights = await this.generateRealtimeInsights(clients, anomalies);
      
      // Store results in local storage for quick access
      localStorage.setItem('realtime_anomalies', JSON.stringify(anomalies));
      localStorage.setItem('realtime_insights', JSON.stringify(insights));
      
      return { anomalies, insights };
    } catch (error) {
      console.error('Error processing realtime data:', error);
      return { anomalies: [], insights: [] };
    }
  }

  private async detectAnomalies(clients: Client[]): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    for (const client of clients) {
      // Revenue drop detection
      if (client.mrr && client.mrr < (client.contractValue * 0.85)) {
        anomalies.push({
          id: `anom_${Date.now()}_${client.id}_revenue`,
          clientId: client.id,
          clientName: client.name,
          anomalyType: 'revenue_drop',
          severity: this.calculateSeverity((client.contractValue - client.mrr) / client.contractValue),
          confidence: 0.85,
          description: `Revenue dropped ${Math.round(((client.contractValue - client.mrr) / client.contractValue) * 100)}% below expected`,
          detectedAt: new Date(),
          suggestedAction: 'Schedule immediate check-in call to understand revenue decline',
          relatedMetrics: { currentMRR: client.mrr, expectedMRR: client.contractValue }
        });
      }

      // NPS drop detection
      if (client.npsScore && client.npsScore < 6) {
        anomalies.push({
          id: `anom_${Date.now()}_${client.id}_nps`,
          clientId: client.id,
          clientName: client.name,
          anomalyType: 'nps_drop',
          severity: client.npsScore < 3 ? 'critical' : 'high',
          confidence: 0.90,
          description: `NPS score critically low at ${client.npsScore}`,
          detectedAt: new Date(),
          suggestedAction: 'Immediate intervention required - schedule emergency client meeting',
          relatedMetrics: { npsScore: client.npsScore }
        });
      }

      // Churn risk detection
      if (client.status === 'at-risk' && client.progress < 30) {
        anomalies.push({
          id: `anom_${Date.now()}_${client.id}_churn`,
          clientId: client.id,
          clientName: client.name,
          anomalyType: 'churn_risk',
          severity: 'high',
          confidence: 0.78,
          description: `High churn risk: At-risk status with ${client.progress}% progress`,
          detectedAt: new Date(),
          suggestedAction: 'Deploy retention strategy immediately',
          relatedMetrics: { status: client.status, progress: client.progress }
        });
      }

      // Payment delay detection
      if (client.lastPayment?.date) {
        const daysSincePayment = Math.floor((new Date().getTime() - new Date(client.lastPayment.date).getTime()) / (1000 * 3600 * 24));
        if (daysSincePayment > 45) { // More than 45 days
          anomalies.push({
            id: `anom_${Date.now()}_${client.id}_payment`,
            clientId: client.id,
            clientName: client.name,
            anomalyType: 'payment_delay',
            severity: daysSincePayment > 60 ? 'critical' : 'high',
            confidence: 0.95,
            description: `Payment overdue by ${daysSincePayment} days`,
            detectedAt: new Date(),
            suggestedAction: 'Contact finance team and client for immediate payment follow-up',
            relatedMetrics: { daysSincePayment, lastPaymentDate: client.lastPayment.date }
          });
        }
      }
    }

    return anomalies;
  }

  private async generateRealtimeInsights(clients: Client[], anomalies: AnomalyDetection[]): Promise<RealTimeInsight[]> {
    const insights: RealTimeInsight[] = [];

    // Generate AI-powered insights optimized for GPT-5-mini
    const systemPrompt: OpenAIMessage = {
      role: 'system',
      content: `AI Business Analyst for SaaS real-time monitoring. Generate actionable insights from client data and anomalies.

      CORE OBJECTIVES:
      • Identify revenue risks with $ impact
      • Spot growth opportunities 
      • Predict client health issues
      • Recommend immediate actions

      JSON OUTPUT FORMAT:
      [{
        "type": "alert" | "opportunity" | "trend" | "prediction",
        "title": "Clear insight with $ impact (under 80 chars)",
        "description": "Actionable recommendation with timeline",
        "confidence": 0.75-0.95,
        "impact": "low" | "medium" | "high" | "critical",
        "affectedClients": ["client names"],
        "financialImpact": "$X at risk" or "$X opportunity",
        "recommendedActions": ["Action 1", "Action 2"],
        "timeline": "immediate" | "this_week" | "this_month",
        "data": {"churnProbability": 0.85, "revenueAtRisk": 15000}
      }]

      Return 2-4 insights. Focus on immediate revenue protection and growth acceleration.`
    };

    const userPrompt: OpenAIMessage = {
      role: 'user',
      content: JSON.stringify({
        clientCount: clients.length,
        anomaliesCount: anomalies.length,
        topAnomalies: anomalies.slice(0, 5),
        clientMetrics: {
          totalMRR: clients.reduce((sum, c) => sum + (c.mrr || 0), 0),
          avgNPS: clients.filter(c => c.npsScore).reduce((sum, c) => sum + c.npsScore!, 0) / clients.filter(c => c.npsScore).length,
          atRiskCount: clients.filter(c => c.status === 'at-risk').length,
          churnedCount: clients.filter(c => c.status === 'churned').length
        }
      })
    };

    try {
      const response = await generateAIResponse([systemPrompt, userPrompt], '');
      const parsedInsights = JSON.parse(response);
      
      if (Array.isArray(parsedInsights)) {
        parsedInsights.forEach((insight, index) => {
          insights.push({
            id: `insight_${Date.now()}_${index}`,
            type: insight.type || 'trend',
            title: insight.title || 'Real-time Insight',
            description: insight.description || '',
            confidence: insight.confidence || 0.75,
            impact: insight.impact || 'medium',
            createdAt: new Date(),
            affectedClients: insight.affectedClients || [],
            data: insight.data || {}
          });
        });
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Fallback insights based on anomalies
      if (anomalies.length > 0) {
        insights.push({
          id: `insight_${Date.now()}_fallback`,
          type: 'alert',
          title: `${anomalies.length} Critical Issues Detected`,
          description: `Real-time monitoring detected ${anomalies.length} anomalies requiring immediate attention.`,
          confidence: 0.90,
          impact: 'high',
          createdAt: new Date(),
          affectedClients: [...new Set(anomalies.map(a => a.clientName))],
          data: { anomalyCount: anomalies.length, severityBreakdown: this.groupBySeverity(anomalies) }
        });
      }
    }

    return insights;
  }

  private calculateSeverity(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage >= 0.4) return 'critical';
    if (percentage >= 0.25) return 'high';
    if (percentage >= 0.15) return 'medium';
    return 'low';
  }

  private groupBySeverity(anomalies: AnomalyDetection[]) {
    return anomalies.reduce((acc, anomaly) => {
      acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Get stored results
  getStoredAnomalies(): AnomalyDetection[] {
    try {
      const stored = localStorage.getItem('realtime_anomalies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getStoredInsights(): RealTimeInsight[] {
    try {
      const stored = localStorage.getItem('realtime_insights');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const realtimeAIProcessor = new RealTimeAIProcessor();