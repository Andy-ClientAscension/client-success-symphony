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
    // Use a temporary API key from local storage if available
    if (!apiKey) {
      apiKey = localStorage.getItem("openai_api_key") || "";
      if (!apiKey) {
        return "Please provide your OpenAI API key in the settings.";
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return `Error: ${errorData.error?.message || "Failed to get response from AI"}`;
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Error communicating with the AI service. Please try again later.";
  }
};

// Updated functions to use encryption

export const saveOpenAIKey = (apiKey: string): void => {
  const encryptedKey = encryptKey(apiKey);
  localStorage.setItem('openai-api-key', encryptedKey);
};

export const getOpenAIKey = (): string => {
  const encryptedKey = localStorage.getItem('openai-api-key') || '';
  return decryptKey(encryptedKey);
};

export const hasOpenAIKey = (): boolean => {
  const encryptedKey = localStorage.getItem('openai-api-key');
  return !!encryptedKey && decryptKey(encryptedKey).length > 0;
};

export const clearOpenAIKey = (): void => {
  localStorage.removeItem('openai-api-key');
};
