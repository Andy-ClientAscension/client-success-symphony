
import { toast } from "@/hooks/use-toast";
import { NPSData, NPSMonthlyTrend } from './data';

// Mock interface to mimic Google Sheets response structure
interface GoogleSheetsResponse {
  data: {
    values: string[][];
  }
}

// This function simulates fetching data from Google Sheets but works in browser environment
export const fetchNPSDataFromSheets = async (): Promise<{ 
  distributionData: NPSData[], 
  trendData: NPSMonthlyTrend[] 
} | null> => {
  try {
    // For browser compatibility, we'll simulate the Google Sheets API response
    // In a production environment, you would:
    // 1. Create a backend API endpoint that uses googleapis and returns the data
    // 2. Call that endpoint from the frontend
    // 3. Or use Google Sheets API v4 via direct REST calls with an API key
    
    // Check network connectivity first
    if (!navigator.onLine) {
      throw new Error('You are currently offline. Please check your internet connection.');
    }
    
    // Simulate network latency and potential errors
    const shouldFail = Math.random() < 0.1; // 10% chance of failure for testing error handling
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (shouldFail) {
      // Simulate a network or API error
      throw new Error('API Error: Could not connect to Google Sheets (simulated failure)');
    }
    
    // Mock API response
    const mockResponse: GoogleSheetsResponse = {
      data: {
        values: [
          ["Jan 2023", "8", "Promoters"],
          ["Jan 2023", "6", "Detractors"],
          ["Jan 2023", "7", "Passives"],
          ["Feb 2023", "9", "Promoters"],
          ["Feb 2023", "9", "Promoters"],
          ["Feb 2023", "7", "Passives"],
          ["Mar 2023", "10", "Promoters"],
          ["Mar 2023", "8", "Promoters"],
          ["Mar 2023", "6", "Detractors"],
          ["Apr 2023", "9", "Promoters"],
          ["Apr 2023", "8", "Promoters"],
          ["Apr 2023", "7", "Passives"],
          ["May 2023", "10", "Promoters"],
          ["May 2023", "9", "Promoters"],
          ["May 2023", "8", "Promoters"],
          ["Jun 2023", "10", "Promoters"],
          ["Jun 2023", "9", "Promoters"],
          ["Jun 2023", "9", "Promoters"],
        ]
      }
    };
    
    // Process the mock response in the same way we would process the real one
    const rows = mockResponse.data.values;
    
    if (!rows || rows.length === 0) {
      throw new Error('No data found in the specified range');
    }
    
    // Process monthly trend data
    const monthlyScores: { [key: string]: number[] } = {};
    
    // Process category distribution data 
    const categoryCountMap: { [key: string]: number } = {
      'Detractors': 0,
      'Passives': 0,
      'Promoters': 0,
    };
    
    rows.forEach(row => {
      const month = row[0]; // Month column
      const score = parseFloat(row[1]); // Score column
      const category = row[2] || getCategoryFromScore(score); // Category column or derive from score
      
      // Add to monthly data
      if (!monthlyScores[month]) {
        monthlyScores[month] = [];
      }
      monthlyScores[month].push(score);
      
      // Add to category distribution
      if (category) {
        categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
      }
    });
    
    // Convert monthly averages to trend data format
    const trendData: NPSMonthlyTrend[] = Object.entries(monthlyScores).map(([month, scores]) => {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return {
        month,
        score: parseFloat(averageScore.toFixed(1)),
        count: scores.length
      };
    }).sort((a, b) => {
      // Convert month to date for proper sorting
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Convert category counts to distribution data format
    const distributionData: NPSData[] = Object.entries(categoryCountMap).map(([label, value]) => ({
      label,
      value,
      score: getCategoryScore(label),
      date: new Date().toISOString().split('T')[0],
      clientId: 'aggregate'
    }));
    
    toast({
      title: "NPS Data Loaded",
      description: "Successfully loaded NPS data from Google Sheets (simulated)",
    });
    
    return { distributionData, trendData };
  } catch (error) {
    console.error('Error fetching NPS data from Google Sheets:', error);
    
    // Provide more specific error messaging
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred while fetching data";
    
    toast({
      title: "Error fetching NPS data",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Important: Throw the error so that React Query's retry and error handling can work
    throw error;
  }
};

// Helper function to categorize NPS scores
const getCategoryFromScore = (score: number): string => {
  if (score >= 0 && score <= 6) return 'Detractors';
  if (score >= 7 && score <= 8) return 'Passives';
  if (score >= 9 && score <= 10) return 'Promoters';
  return 'Unknown';
};

// Helper function to get representative score for a category
const getCategoryScore = (category: string): number => {
  switch (category) {
    case 'Detractors': return 3;
    case 'Passives': return 7;
    case 'Promoters': return 9;
    default: return 0;
  }
};

// Update a specific NPS score in Google Sheets
// This would require a backend implementation in a real-world scenario
export const updateNPSScoreInSheets = async (
  clientId: string, 
  score: number
): Promise<boolean> => {
  try {
    console.log(`Would update NPS score for client ${clientId} to ${score} in Google Sheets`);
    
    // Check network connectivity first
    if (!navigator.onLine) {
      throw new Error('You are currently offline. Please check your internet connection.');
    }
    
    // Simulate API delay and potential errors
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simulate successful update
    toast({
      title: "NPS Score Updated",
      description: `Score of ${score} recorded for client ${clientId}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error updating NPS score:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to update NPS score. Please try again.";
    
    toast({
      title: "Error Updating Score",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  }
};
