
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

    // Create system prompt optimized for GPT-5-mini
    const systemPrompt: OpenAIMessage = {
      role: 'system',
      content: `You are an AI Revenue Operations Analyst for SaaS businesses. Generate actionable business insights from client data.

      ANALYSIS PRIORITIES:
      • Revenue Risk: Identify churn threats with $ impact
      • Growth Opportunities: Find expansion potential
      • Client Health: Assess satisfaction and usage patterns
      • Performance Trends: Compare against SaaS benchmarks

      OUTPUT RULES:
      • Return valid JSON array only
      • Focus on high-impact, actionable insights
      • Include specific financial estimates
      • Prioritize immediate revenue protection

      JSON FORMAT:
      [{
        "type": "warning" | "recommendation" | "improvement" | "prediction",
        "message": "Clear insight with $ impact (under 100 chars)",
        "severity": "critical" | "high" | "medium" | "low",
        "affectedClients": ["client names"],
        "financialImpact": "$X at risk" or "$X opportunity",
        "confidence": 0.75-0.95,
        "actionItems": ["Action 1", "Action 2"],
        "timeframe": "immediate" | "this_week" | "this_month"
      }]

      Return 3-5 insights maximum. Focus on revenue protection and growth acceleration.`
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
