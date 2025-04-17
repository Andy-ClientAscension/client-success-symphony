
import { Message } from "./types";

interface AIMessageProps {
  message: Message;
}

export const AIMessage = ({ message }: AIMessageProps) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-lg p-2 text-sm ${
          message.role === 'user' 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {message.content}
        <div className={`text-xs mt-1 ${
          message.role === 'user' ? 'text-red-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
