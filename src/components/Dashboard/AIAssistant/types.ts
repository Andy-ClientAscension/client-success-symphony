
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SystemHealthCheck {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
