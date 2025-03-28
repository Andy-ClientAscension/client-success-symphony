
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
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // This is where we'd normally make the API call to Google Sheets
    // Since googleapis doesn't work directly in browser, we'll use mock data
    // that represents what would come from your sheet
    
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
        score: parseFloat(averageScore.toFixed(1))
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
    }));
    
    toast({
      title: "NPS Data Loaded",
      description: "Successfully loaded NPS data from Google Sheets (simulated)",
    });
    
    return { distributionData, trendData };
  } catch (error) {
    console.error('Error fetching NPS data from Google Sheets:', error);
    toast({
      title: "Error fetching NPS data",
      description: "Could not fetch data from Google Sheets. Using mock data instead.",
      variant: "destructive",
    });
    return null;
  }
};

// Helper function to categorize NPS scores
const getCategoryFromScore = (score: number): string => {
  if (score >= 0 && score <= 6) return 'Detractors';
  if (score >= 7 && score <= 8) return 'Passives';
  if (score >= 9 && score <= 10) return 'Promoters';
  return 'Unknown';
};

// Update a specific NPS score in Google Sheets
// This would require a backend implementation in a real-world scenario
export const updateNPSScoreInSheets = async (
  clientId: string, 
  score: number
): Promise<boolean> => {
  console.log(`Would update NPS score for client ${clientId} to ${score} in Google Sheets`);
  
  // Simulate success
  toast({
    title: "NPS Score Updated",
    description: `Score of ${score} recorded for client ${clientId}`,
  });
  
  return true;
};
