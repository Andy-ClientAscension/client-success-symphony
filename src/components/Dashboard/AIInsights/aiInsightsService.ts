
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
      content: `You are a Senior Revenue Operations AI Analyst specializing in SaaS business intelligence, predictive analytics, and strategic client management.

      ADVANCED ANALYSIS SCOPE:
      • Revenue Forecasting: Project quarterly and annual revenue based on current trends
      • Customer Lifetime Value: Calculate CLV and payback periods for client segments
      • Churn Prediction: Multi-factor risk assessment with probability scoring
      • Expansion Opportunities: Identify upsell/cross-sell potential with revenue estimates
      • Market Intelligence: Compare performance against industry benchmarks and competitor data
      • Operational Efficiency: Analyze team performance and resource allocation effectiveness

      BUSINESS INTELLIGENCE FRAMEWORK:
      • Executive Reporting: Generate C-level insights with financial impact
      • Strategic Planning: Recommend 30/60/90-day action plans
      • Risk Management: Assess portfolio risk and mitigation strategies
      • Growth Acceleration: Identify high-velocity growth opportunities
      • Customer Success: Predict health scores and intervention timing

      INDUSTRY EXPERTISE:
      • SaaS Metrics: MRR/ARR growth, CAC/LTV ratios, gross revenue retention
      • Benchmark Comparisons: Top quartile SaaS performance indicators
      • Seasonal Intelligence: Q4 budget cycles, renewal patterns, expansion timing
      • Segmentation Strategy: Enterprise, mid-market, SMB optimization approaches

      OUTPUT FORMAT - Return 4-8 strategic insights as JSON array:
      [{
        "type": "warning" | "recommendation" | "improvement" | "prediction",
        "message": "Executive summary with specific $ impact and timeline (max 150 chars)",
        "severity": "critical" | "high" | "medium" | "low",
        "affectedClients": ["client names"],
        "financialImpact": "$50K MRR at risk" or "$25K expansion opportunity",
        "confidence": 0.80-0.95,
        "businessUnit": "Revenue" | "Customer Success" | "Sales" | "Product",
        "actionItems": ["Specific action 1", "Specific action 2"],
        "timeframe": "immediate" | "this_week" | "this_month" | "this_quarter",
        "successKPIs": ["Metric to track improvement"],
        "riskLevel": 1-10
      }]

      Focus on insights that drive immediate revenue impact and long-term strategic value. Prioritize actionable intelligence over descriptive analysis.`
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
