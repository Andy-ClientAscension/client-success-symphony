
import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "./types";
import { AIMessage } from "./AIMessage";

interface AIMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const AIMessageList = ({ messages, isLoading }: AIMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-3 space-y-3">
      {messages.map((message, index) => (
        <AIMessage key={index} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            <span className="text-sm text-gray-600">Thinking...</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
