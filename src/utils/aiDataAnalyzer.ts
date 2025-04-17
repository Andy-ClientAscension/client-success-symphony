
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
    // Define default insights in case of failure
    const defaultInsights: AIInsight[] = [{
      type: 'improvement',
      message: 'No critical issues detected in your client data at this time.',
      severity: 'low'
    }];
    
    // If no clients, return default insights
    if (!clients || clients.length === 0) {
      console.log('No clients provided for analysis');
      saveData(STORAGE_KEYS.AI_INSIGHTS, defaultInsights);
      return defaultInsights;
    }

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
      Severity can be: 'low', 'medium', or 'high'.
      
      Important: Your response must be valid JSON array and nothing else. Example: [{"type": "warning", "message": "Example message", "severity": "medium"}]`
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

    // Attempt to get AI response
    const response = await generateAIResponse([systemPrompt, userPrompt], '');
    
    // Parse the response
    let insights: AIInsight[] = [];
    try {
      // First check if the response starts with a bracket (valid JSON array)
      const trimmedResponse = response.trim();
      const processedResponse = trimmedResponse.startsWith('[') ? trimmedResponse : `[${trimmedResponse}]`;
      
      // Try to parse the processed response
      insights = JSON.parse(processedResponse);
      
      // Validate the insights format and filter out invalid entries
      insights = insights.filter(insight => {
        if (!insight || typeof insight !== 'object') return false;
        
        // Ensure required fields exist and are valid
        const hasValidType = insight.type && ['warning', 'recommendation', 'improvement'].includes(insight.type);
        const hasValidMessage = insight.message && typeof insight.message === 'string';
        const hasValidSeverity = insight.severity && ['low', 'medium', 'high'].includes(insight.severity);
        
        return hasValidType && hasValidMessage && hasValidSeverity;
      });
      
      console.log('Successfully parsed and validated AI insights:', insights.length);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      insights = defaultInsights;
    }
    
    // Ensure we always have at least one insight
    if (!insights || insights.length === 0) {
      insights = defaultInsights;
    }
    
    // Save insights to local storage
    saveData(STORAGE_KEYS.AI_INSIGHTS, insights);
    
    return insights;
  } catch (error) {
    console.error('AI Data Analysis Error:', error);
    const fallbackInsight = {
      type: 'warning' as const,
      message: 'An error occurred while analyzing client data. Please try again later.',
      severity: 'medium' as const
    };
    
    saveData(STORAGE_KEYS.AI_INSIGHTS, [fallbackInsight]);
    return [fallbackInsight];
  }
}

export function getStoredAIInsights(): AIInsight[] {
  try {
    const storedInsights = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
    if (!storedInsights) return [];
    
    const parsedInsights = JSON.parse(storedInsights);
    if (!Array.isArray(parsedInsights)) return [];
    
    // Validate each insight
    return parsedInsights.filter(insight => 
      insight && 
      typeof insight === 'object' &&
      insight.type && 
      insight.message && 
      insight.severity
    );
  } catch (error) {
    console.error('Error retrieving stored AI insights:', error);
    return [];
  }
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
