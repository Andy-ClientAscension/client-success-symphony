
import { AIInsight } from '@/utils/aiDataAnalyzer';
import { generateAIResponse, OpenAIMessage } from '@/lib/openai';

// Generates AI insights from client data
export async function generateClientInsights(
  clients: any[], 
  metrics: any, 
  statusCounts: {
    active: number;
    atRisk: number;
    churned: number;
    new: number;
    total: number;
  },
  rates: {
    churnRate: number;
    retentionRate: number;
    atRiskRate: number;
  }
): Promise<AIInsight[]> {
  try {
    // Prepare relevant data for analysis
    const analysisData = {
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        mrr: client.mrr,
        npsScore: client.npsScore,
        progress: client.progress
      })),
      metrics: {
        totalMRR: metrics?.totalMRR || 0,
        totalCallsBooked: metrics?.totalCallsBooked || 0,
        totalDealsClosed: metrics?.totalDealsClosed || 0
      },
      statusCounts,
      rates
    };

    // Create system prompt for AI
    const systemPrompt: OpenAIMessage = {
      role: 'system',
      content: `You are an AI business analyst specializing in client retention and revenue optimization.
      
      Analyze the provided client and business data to identify:
      1. Churn risks and retention opportunities
      2. Revenue optimization strategies
      3. Growth patterns and opportunities
      4. Concerning trends that require immediate attention
      
      Return 4-6 actionable insights in JSON format, with each insight having:
      - "type": either "warning" (problem), "recommendation" (action), or "improvement" (opportunity)
      - "message": a clear, specific insight with actionable advice (max 150 characters)
      - "severity": "high", "medium", or "low" priority
      - "affectedClients": array of client names most affected (optional)
      
      Focus on being specific, actionable, and business-relevant. Only return valid JSON array with no additional text.`
    };

    // User prompt with the data
    const userPrompt: OpenAIMessage = {
      role: 'user',
      content: JSON.stringify(analysisData)
    };

    // Generate AI response
    const response = await generateAIResponse([systemPrompt, userPrompt], '');
    
    // Parse the response
    let insights: AIInsight[] = [];
    try {
      // Clean up response to handle cases where AI might add commentary
      const responseText = response.trim();
      const jsonStartIndex = responseText.indexOf('[');
      const jsonEndIndex = responseText.lastIndexOf(']') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex);
        insights = JSON.parse(jsonStr);
      } else {
        // Fallback to trying to parse the entire response
        insights = JSON.parse(responseText);
      }
      
      // Validate the insights format
      insights = insights.filter(insight => {
        return insight && 
               typeof insight === 'object' &&
               insight.type && 
               insight.message && 
               insight.severity;
      });
      
      return insights;
    } catch (error) {
      console.error('Error parsing insights:', error);
      throw new Error('Failed to parse AI insights');
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}

// Helper function to categorize insights
export function categorizeInsights(insights: AIInsight[]) {
  return {
    warnings: insights.filter(i => i.type === 'warning'),
    recommendations: insights.filter(i => i.type === 'recommendation'),
    improvements: insights.filter(i => i.type === 'improvement'),
    highPriority: insights.filter(i => i.severity === 'high'),
    mediumPriority: insights.filter(i => i.severity === 'medium'),
    lowPriority: insights.filter(i => i.severity === 'low')
  };
}
