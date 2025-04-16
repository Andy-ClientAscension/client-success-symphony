
import { Client } from '@/lib/data';
import { generateAIResponse, OpenAIMessage } from '@/lib/openai';
import { saveData, STORAGE_KEYS } from '@/utils/persistence';

export interface AIInsight {
  type: 'warning' | 'recommendation' | 'improvement';
  message: string;
  affectedClients?: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface PerformanceTrend {
  clientId: string;
  clientName: string;
  metric: 'mrr' | 'callsBooked' | 'dealsClosed' | 'npsScore';
  trend: 'improving' | 'declining' | 'stable';
  percentChange: number;
}

export interface ClientComparison {
  metricName: string;
  topPerformers: {
    clientId: string;
    clientName: string;
    value: number;
  }[];
  averageValue: number;
}

export async function analyzeClientData(clients: Client[]): Promise<AIInsight[]> {
  try {
    const systemPrompt: OpenAIMessage = {
      role: 'system',
      content: `Analyze client data for potential issues, risks, and improvements. 
      Focus on:
      - Clients at risk of churn
      - Performance inconsistencies
      - Potential growth opportunities
      - Unusual patterns in metrics
      
      Return insights in JSON format with 'type', 'message', 'affectedClients', and 'severity' fields.
      Types can be: 'warning', 'recommendation', or 'improvement'.
      Severity can be: 'low', 'medium', or 'high'.`
    };

    const userPrompt: OpenAIMessage = {
      role: 'user',
      content: JSON.stringify(clients.map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        progress: client.progress,
        mrr: client.mrr,
        callsBooked: client.callsBooked,
        dealsClosed: client.dealsClosed,
        npsScore: client.npsScore
      })))
    };

    const response = await generateAIResponse([systemPrompt, userPrompt], '');
    
    // Parse the response
    let insights: AIInsight[] = [];
    try {
      insights = JSON.parse(response);
      
      // Validate the insights format
      insights = insights.filter(insight => 
        insight.type && 
        insight.message && 
        insight.severity
      );
    } catch (error) {
      console.error('Error parsing AI response:', error);
      insights = [{
        type: 'warning',
        message: 'Unable to generate insights from available data. Please try again later.',
        severity: 'medium'
      }];
    }
    
    // Save insights to local storage
    saveData(STORAGE_KEYS.AI_INSIGHTS, insights);
    
    return insights;
  } catch (error) {
    console.error('AI Data Analysis Error:', error);
    return [{
      type: 'warning',
      message: 'An error occurred while analyzing client data. Please try again later.',
      severity: 'medium'
    }];
  }
}

export function getStoredAIInsights(): AIInsight[] {
  return localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) 
    ? JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) || '[]') 
    : [];
}

export function calculatePerformanceTrends(clients: Client[]): PerformanceTrend[] {
  const trends: PerformanceTrend[] = [];
  
  // Simplified trend calculation (in a real app, you would use historical data)
  clients.forEach(client => {
    if (client.mrr !== undefined && client.mrr > 0) {
      // For demo purposes, creating a random trend
      const randomChange = Math.floor(Math.random() * 30) - 15; // -15 to +15
      trends.push({
        clientId: client.id,
        clientName: client.name,
        metric: 'mrr',
        trend: randomChange > 0 ? 'improving' : randomChange < 0 ? 'declining' : 'stable',
        percentChange: Math.abs(randomChange)
      });
    }
  });
  
  return trends;
}

export function generateClientComparisons(clients: Client[]): ClientComparison[] {
  const comparisons: ClientComparison[] = [];
  
  // MRR Comparison
  const validMrrClients = clients.filter(c => c.mrr !== undefined && c.mrr > 0);
  if (validMrrClients.length > 0) {
    const avgMrr = validMrrClients.reduce((sum, c) => sum + (c.mrr || 0), 0) / validMrrClients.length;
    const topMrrClients = [...validMrrClients]
      .sort((a, b) => (b.mrr || 0) - (a.mrr || 0))
      .slice(0, 3)
      .map(c => ({ clientId: c.id, clientName: c.name, value: c.mrr || 0 }));
      
    comparisons.push({
      metricName: 'Monthly Recurring Revenue',
      topPerformers: topMrrClients,
      averageValue: avgMrr
    });
  }
  
  // NPS Score Comparison
  const validNpsClients = clients.filter(c => c.npsScore !== undefined);
  if (validNpsClients.length > 0) {
    const avgNps = validNpsClients.reduce((sum, c) => sum + (c.npsScore || 0), 0) / validNpsClients.length;
    const topNpsClients = [...validNpsClients]
      .sort((a, b) => (b.npsScore || 0) - (a.npsScore || 0))
      .slice(0, 3)
      .map(c => ({ clientId: c.id, clientName: c.name, value: c.npsScore || 0 }));
      
    comparisons.push({
      metricName: 'NPS Score',
      topPerformers: topNpsClients,
      averageValue: avgNps
    });
  }
  
  return comparisons;
}
