
import { Client } from '@/lib/data';
import { generateAIResponse, OpenAIMessage } from '@/lib/openai';
import { saveData, STORAGE_KEYS } from '@/utils/persistence';

export interface AIInsight {
  type: 'warning' | 'recommendation' | 'improvement';
  message: string;
  affectedClients?: string[];
  severity: 'low' | 'medium' | 'high';
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
      - Unusual patterns in metrics`
    };

    const userPrompt: OpenAIMessage = {
      role: 'user',
      content: JSON.stringify(clients.map(client => ({
        id: client.id,
        status: client.status,
        progress: client.progress,
        mrr: client.mrr,
        callsBooked: client.callsBooked,
        dealsClosed: client.dealsClosed,
        npsScore: client.npsScore
      })))
    };

    const response = await generateAIResponse([systemPrompt, userPrompt], '');
    
    const insights: AIInsight[] = JSON.parse(response);
    
    // Save insights to local storage
    saveData(STORAGE_KEYS.AI_INSIGHTS, insights);
    
    return insights;
  } catch (error) {
    console.error('AI Data Analysis Error:', error);
    return [];
  }
}

export function getStoredAIInsights(): AIInsight[] {
  return localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) 
    ? JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS) || '[]') 
    : [];
}
