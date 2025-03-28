
import { google } from 'googleapis';
import { toast } from "@/hooks/use-toast";
import { NPSData, NPSMonthlyTrend } from './data';

// This will need to be replaced with your actual Google Sheets credentials
// You'll need to create a service account and download the credentials
const CREDENTIALS = {
  client_email: "",
  private_key: "",
};

// This should be updated with your specific Google Sheet ID and range
const SHEET_ID = "";
const NPS_RANGE = "NPS!A2:C"; // Assuming columns A-C contain month, score, and category data

// Initialize the Google Sheets API client
export const initGoogleSheetsClient = () => {
  try {
    const client = new google.auth.JWT(
      CREDENTIALS.client_email,
      undefined,
      CREDENTIALS.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );
    
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    toast({
      title: "Error connecting to NPS data",
      description: "Could not connect to Google Sheets. Using mock data instead.",
      variant: "destructive",
    });
    return null;
  }
};

// Fetch NPS data from Google Sheets
export const fetchNPSDataFromSheets = async (): Promise<{ 
  distributionData: NPSData[], 
  trendData: NPSMonthlyTrend[] 
} | null> => {
  try {
    const sheets = initGoogleSheetsClient();
    
    if (!sheets) {
      return null;
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: NPS_RANGE,
    });
    
    const rows = response.data.values;
    
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
    }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    
    // Convert category counts to distribution data format
    const distributionData: NPSData[] = Object.entries(categoryCountMap).map(([label, value]) => ({
      label,
      value,
    }));
    
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
// This would require write permission and implementation details 
// depending on how your sheet is structured
export const updateNPSScoreInSheets = async (
  clientId: string, 
  score: number
): Promise<boolean> => {
  // This is a placeholder for the actual implementation
  // You would need to determine where in your sheet this client's data should be updated
  console.log(`Would update NPS score for client ${clientId} to ${score} in Google Sheets`);
  
  // For now, return true to indicate success
  // In a real implementation, this would only return true if the update was successful
  return true;
};
