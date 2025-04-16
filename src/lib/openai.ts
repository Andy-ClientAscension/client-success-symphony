
// OpenAI API service

interface OpenAIMessage {
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

// Function to save API key in localStorage
export const saveOpenAIKey = (apiKey: string): void => {
  localStorage.setItem("openai_api_key", apiKey);
};

// Function to get API key from localStorage
export const getOpenAIKey = (): string => {
  return localStorage.getItem("openai_api_key") || "";
};

// Function to check if the API key exists
export const hasOpenAIKey = (): boolean => {
  return !!localStorage.getItem("openai_api_key");
};
