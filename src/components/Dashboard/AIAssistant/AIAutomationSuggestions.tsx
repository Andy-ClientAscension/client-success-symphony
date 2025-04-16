
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAutomationSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

export function AIAutomationSuggestions({ onSelectSuggestion }: AIAutomationSuggestionsProps) {
  const suggestions = [
    "Analyze client health scores",
    "Generate monthly report",
    "Automate renewal reminders",
    "Identify at-risk clients",
    "Summarize today's tasks",
    "What services can I automate?",
    "How can I improve client retention?",
    "Show me insights from my data"
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
          onClick={() => onSelectSuggestion(suggestion)}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
