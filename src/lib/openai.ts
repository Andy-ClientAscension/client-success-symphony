
// OpenAI API service

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Simple encryption function for API keys 
const encryptKey = (key: string): string => {
  if (!key) return '';
  
  try {
    // Simple XOR-based encryption with a fixed "salt"
    const salt = "lovable-ai-assistant-salt-2025";
    let encrypted = '';
    
    for (let i = 0; i < key.length; i++) {
      // XOR each character with the corresponding salt character
      const keyChar = key.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      encrypted += String.fromCharCode(keyChar ^ saltChar);
    }
    
    // Convert to base64 for safe storage
    return btoa(encrypted);
  } catch (error) {
    console.error("Error encrypting API key:", error);
    return '';
  }
};

// Decryption function to retrieve the original key
const decryptKey = (encryptedKey: string): string => {
  if (!encryptedKey) return '';
  
  try {
    // Decode from base64
    const decoded = atob(encryptedKey);
    const salt = "lovable-ai-assistant-salt-2025";
    let decrypted = '';
    
    for (let i = 0; i < decoded.length; i++) {
      // Reverse the XOR operation
      const encryptedChar = decoded.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      decrypted += String.fromCharCode(encryptedChar ^ saltChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error("Error decrypting API key:", error);
    return '';
  }
};

export const generateAIResponse = async (
  messages: OpenAIMessage[],
  apiKey: string
): Promise<string> => {
  try {
    // Use OpenRouter API key from Supabase if not provided
    if (!apiKey) {
      apiKey = localStorage.getItem("openai_api_key") || "";
      if (!apiKey) {
        return "Please provide your OpenRouter API key in the settings.";
      }
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Dashboard Assistant",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini-2025-08-07",
        messages,
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return `Error: ${errorData.error?.message || "Failed to get response from AI"}`;
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return "Error communicating with the AI service. Please try again later.";
  }
};

// Updated functions to use encryption

export const saveOpenRouterKey = (apiKey: string): void => {
  const encryptedKey = encryptKey(apiKey);
  localStorage.setItem('openrouter-api-key', encryptedKey);
};

export const getOpenRouterKey = (): string => {
  const encryptedKey = localStorage.getItem('openrouter-api-key') || '';
  return decryptKey(encryptedKey);
};

export const hasOpenRouterKey = (): boolean => {
  const encryptedKey = localStorage.getItem('openrouter-api-key');
  return !!encryptedKey && decryptKey(encryptedKey).length > 0;
};

export const clearOpenRouterKey = (): void => {
  localStorage.removeItem('openrouter-api-key');
};

// Legacy OpenAI key functions for backwards compatibility
export const saveOpenAIKey = saveOpenRouterKey;
export const getOpenAIKey = getOpenRouterKey;
export const hasOpenAIKey = hasOpenRouterKey;
export const clearOpenAIKey = clearOpenRouterKey;
