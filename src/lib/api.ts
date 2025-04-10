
// This file provides API integrations with external services

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SlackMessage {
  messageId: string;
}

interface AirtableRecord {
  id: string;
}

interface StripeCustomer {
  id: string;
  name: string;
  email: string;
}

// API Services Registry
export const availableApiServices = [
  { id: "slack", name: "Slack", description: "Connect to Slack for client messaging" },
  { id: "airtable", name: "Airtable", description: "Connect to Airtable for data management" },
  { id: "stripe", name: "Stripe", description: "Connect to Stripe for payment processing" },
  { id: "zapier", name: "Zapier", description: "Connect to Zapier for workflow automation" },
  { id: "hubspot", name: "HubSpot", description: "Connect to HubSpot for CRM integration" }
];

// Mock API integrations that can be replaced with actual implementations later
export const apiIntegrations = {
  // Slack integration example
  slack: {
    sendMessage: async (channelId: string, message: string): Promise<ApiResponse<SlackMessage>> => {
      // Mocked response
      console.log(`Sending message to Slack channel ${channelId}: ${message}`);
      return {
        success: true,
        data: {
          messageId: `msg_${Date.now()}`
        }
      };
    }
  },
  
  // Airtable integration example
  airtable: {
    getRecords: async <T>(table: string): Promise<ApiResponse<T[]>> => {
      console.log(`Fetching records from Airtable table: ${table}`);
      return {
        success: true,
        data: [] as T[]
      };
    },
    
    createRecord: async <T>(table: string, data: T): Promise<ApiResponse<AirtableRecord>> => {
      console.log(`Creating record in Airtable table ${table}:`, data);
      return {
        success: true,
        data: {
          id: `rec_${Date.now()}`
        }
      };
    }
  },
  
  // Stripe integration example
  stripe: {
    getCustomer: async (customerId: string): Promise<ApiResponse<StripeCustomer>> => {
      console.log(`Fetching Stripe customer: ${customerId}`);
      return {
        success: true,
        data: {
          id: customerId,
          name: "Example Customer",
          email: "customer@example.com"
        }
      };
    },
    
    getPayments: async <T>(customerId: string): Promise<ApiResponse<T[]>> => {
      console.log(`Fetching payments for Stripe customer: ${customerId}`);
      return {
        success: true,
        data: [] as T[]
      };
    }
  },
  
  // Add new service integrations here
  zapier: {
    triggerWebhook: async (webhookUrl: string, payload: any): Promise<ApiResponse<any>> => {
      console.log(`Triggering Zapier webhook: ${webhookUrl}`, payload);
      return {
        success: true,
        data: { triggered: true, timestamp: new Date() }
      };
    }
  },
  
  hubspot: {
    getContacts: async (): Promise<ApiResponse<any[]>> => {
      console.log(`Fetching HubSpot contacts`);
      return {
        success: true,
        data: []
      };
    },
    createContact: async (contactData: any): Promise<ApiResponse<any>> => {
      console.log(`Creating HubSpot contact:`, contactData);
      return {
        success: true,
        data: { id: `contact_${Date.now()}` }
      };
    }
  }
};

// API connection utilities
export const validateApiKey = async (apiType: string, apiKey: string): Promise<boolean> => {
  // This would normally verify the key with the actual service
  // For demo purposes, we'll just check if it has a reasonable length
  console.log(`Validating ${apiType} API key: ${apiKey.substring(0, 3)}...`);
  return apiKey.length >= 8;
};

// API settings storage (would typically be in a secure store or database)
export const saveApiSettings = (apiType: string, apiKey: string): void => {
  // In a real app, this would be stored securely
  // For demo purposes, we're just logging it
  console.log(`Saving API settings for ${apiType}`);
  
  // Store in localStorage for persistence between sessions
  const apiSettings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
  apiSettings[apiType] = {
    connected: true,
    lastConnected: new Date().toISOString()
  };
  localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
};

// Check if an API is connected
export const isApiConnected = (apiType: string): boolean => {
  const apiSettings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
  return apiSettings[apiType]?.connected === true;
};

// Example of creating a generic API client
export const createApiClient = (token: string) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  return {
    get: async <T>(url: string): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    },
    
    post: async <T, U = unknown>(url: string, body: U): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    }
  };
};
