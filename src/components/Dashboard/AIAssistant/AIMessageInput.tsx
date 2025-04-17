
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIAutomationSuggestions } from "./AIAutomationSuggestions";

interface AIMessageInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
}

export function AIMessageInput({
  input,
  isLoading,
  onInputChange,
  onKeyDown,
  onSendMessage
}: AIMessageInputProps) {
  return (
    <div className="p-3 border-t">
      <AIAutomationSuggestions onSelectSuggestion={(suggestion) => onInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLTextAreaElement>)} />
      
      <div className="flex mt-2">
        <Textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Ask a question..."
          className="resize-none min-h-[60px]"
          disabled={isLoading}
        />
        <Button 
          className="ml-2 bg-red-600 hover:bg-red-700 self-end"
          disabled={isLoading || !input.trim()}
          onClick={onSendMessage}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
