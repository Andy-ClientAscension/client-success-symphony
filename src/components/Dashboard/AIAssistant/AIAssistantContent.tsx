import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateAIResponse, getOpenAIKey, hasOpenAIKey, OpenAIMessage } from "@/lib/openai";
import { useSystemHealth } from '@/hooks/use-system-health';
import { Message } from "./types";
import { AIMessageList } from "./AIMessageList";
import { AIMessageInput } from "./AIMessageInput";

interface AIAssistantContentProps {
  isOpen: boolean;
  dismissedAlerts: Record<string, boolean>;
}

export function AIAssistantContent({ isOpen, dismissedAlerts }: AIAssistantContentProps) {
  const { healthChecks } = useSystemHealth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant powered by GPT-4o-mini. I can help analyze client data, generate reports, and automate routine tasks. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const { toast } = useToast();
  const [lastProcessedHealthChecks, setLastProcessedHealthChecks] = useState<Array<any>>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!hasOpenAIKey()) {
        const errorMessage: Message = {
          role: "assistant",
          content: "API key not configured. Please set up your OpenRouter API key in the settings (gear icon) to use AI features.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const messageHistory: OpenAIMessage[] = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messageHistory.unshift({
        role: "system",
        content: `You are Maya, a Senior AI Business Intelligence Analyst with 15+ years of experience in SaaS revenue operations, customer success, and strategic planning.

EXPERTISE AREAS:
• Revenue Analytics: MRR/ARR forecasting, cohort analysis, revenue optimization
• Customer Intelligence: Churn prediction, health scoring, expansion opportunity identification  
• Strategic Planning: Executive reporting, KPI dashboards, performance benchmarking
• Operational Excellence: Process automation, team efficiency, resource allocation
• Market Intelligence: Competitive analysis, industry benchmarking, trend identification

DASHBOARD CONTEXT AWARENESS:
• Real-time client metrics and health scores
• Revenue trends and pipeline analysis
• Team performance and activity tracking
• AI-generated insights and anomaly detection
• Predictive models and risk assessments

COMMUNICATION STYLE:
• Executive-ready insights with financial impact quantification
• Actionable recommendations with specific timelines
• Data-driven storytelling with clear next steps
• Proactive alerts for high-impact opportunities/risks
• Natural conversation with technical depth when needed

CAPABILITIES:
• Generate executive summaries and board-ready reports
• Perform "what-if" scenario analysis and modeling
• Recommend specific actions with ROI projections
• Identify patterns across client portfolio
• Suggest process improvements and automations
• Create custom analyses based on your specific questions

Ask me anything about your client portfolio, revenue trends, strategic planning, or operational optimization. I can analyze current data, predict future outcomes, and recommend specific actions to drive growth and retention.`
      });
      
      const response = await generateAIResponse(messageHistory, getOpenAIKey());
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      toast({
        title: "AI Assistant Response",
        description: "New insights are available from your AI assistant",
      });
    } catch (error) {
      console.error("Error processing AI response:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (
      healthChecks.length > 0 && 
      (
        lastProcessedHealthChecks.length !== healthChecks.length || 
        JSON.stringify(lastProcessedHealthChecks) !== JSON.stringify(healthChecks)
      )
    ) {
      const highSeverityChecks = healthChecks.filter(check => 
        check.severity === 'high' && 
        !dismissedAlerts[check.id || check.message]
      );
      
      if (highSeverityChecks.length > 0 && isOpen) {
        const healthMessage = highSeverityChecks.map(check => 
          `System Alert: ${check.message} (Type: ${check.type})`
        ).join('\n');
        
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I've detected ${highSeverityChecks.length} high-priority system health issues:\n\n` + 
                     healthMessage + 
                     '\n\nWould you like me to help address these issues?',
            timestamp: new Date()
          }
        ]);
      }
      
      if (!isOpen && highSeverityChecks.length > 0) {
        toast({
          title: "System Health Alerts",
          description: `${highSeverityChecks.length} high-priority issues detected`,
          variant: "destructive",
        });
      }
      
      setLastProcessedHealthChecks(healthChecks);
    }
  }, [healthChecks, lastProcessedHealthChecks, isOpen, toast, dismissedAlerts]);

  return (
    <>
      <AIMessageList messages={messages} isLoading={isLoading} />
      
      <AIMessageInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}
