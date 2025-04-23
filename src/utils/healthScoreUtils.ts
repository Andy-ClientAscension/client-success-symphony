
import { format, subDays } from 'date-fns';
import { STORAGE_KEYS, loadData, saveData } from './persistence';

// Risk category definitions
export const RISK_CATEGORIES: StudentHealth.RiskCategory[] = [
  { level: 'critical', threshold: 0, color: '#ea384c' },   // Red
  { level: 'high', threshold: 30, color: '#f97316' },      // Orange
  { level: 'medium', threshold: 60, color: '#facc15' },    // Yellow
  { level: 'low', threshold: 80, color: '#84cc16' }        // Green
];

// Get risk category based on score
export const getRiskCategory = (score: number): StudentHealth.RiskCategory => {
  // Find the highest threshold that is less than or equal to the score
  const category = [...RISK_CATEGORIES]
    .reverse()
    .find(cat => score >= cat.threshold);
    
  return category || RISK_CATEGORIES[0]; // Default to critical if no match
};

// Weight factors for calculating health score
const FACTOR_WEIGHTS = {
  engagement: 0.25,
  progress: 0.3,
  sentiment: 0.2,
  attendance: 0.15,
  completion: 0.1
};

// Calculate health score from factors
export const calculateHealthScore = (factors: StudentHealth.HealthScoreFactors): number => {
  let weightedScore = 0;
  
  // Calculate weighted sum
  weightedScore += factors.engagement * FACTOR_WEIGHTS.engagement;
  weightedScore += factors.progress * FACTOR_WEIGHTS.progress;
  weightedScore += factors.sentiment * FACTOR_WEIGHTS.sentiment;
  weightedScore += factors.attendance * FACTOR_WEIGHTS.attendance;
  weightedScore += factors.completion * FACTOR_WEIGHTS.completion;
  
  // Round to nearest integer
  return Math.round(weightedScore);
};

// Extract health score factors from bi-weekly notes
export const extractFactorsFromNotes = (notes: any[]): StudentHealth.HealthScoreFactors => {
  // Default baseline factors
  const defaultFactors: StudentHealth.HealthScoreFactors = {
    engagement: 50,
    progress: 50,
    sentiment: 50,
    attendance: 50,
    completion: 50
  };
  
  if (!notes || notes.length === 0) {
    return defaultFactors;
  }
  
  // Sort notes by date, newest first
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get the most recent note
  const recentNote = sortedNotes[0];
  
  // Extract factors from most recent note
  const factors: StudentHealth.HealthScoreFactors = {
    // Map health score from 1-10 scale to 0-100 scale
    sentiment: recentNote.healthScore ? recentNote.healthScore * 10 : defaultFactors.sentiment,
    
    // Map engagement based on updatesInteractions content
    engagement: recentNote.updatesInteractions ? 
      (recentNote.updatesInteractions.length > 50 ? 80 : 60) : 
      defaultFactors.engagement,
    
    // Map progress based on wins vs struggles
    progress: recentNote.wins && recentNote.struggles ? 
      (recentNote.wins.length > recentNote.struggles.length ? 75 : 55) : 
      defaultFactors.progress,
    
    // Map attendance based on booked calls
    attendance: recentNote.bookedCalls ? 
      Math.min(100, recentNote.bookedCalls * 20) : 
      defaultFactors.attendance,
    
    // Use default completion since we don't have a direct mapping
    completion: defaultFactors.completion
  };
  
  return factors;
};

// Calculate trend over a specific period
export const calculateTrend = (
  history: StudentHealth.HealthScoreHistory[], 
  days: number
): StudentHealth.HealthScoreTrend => {
  const now = new Date();
  const startDate = subDays(now, days);
  
  // Filter history to get entries within the specified period
  const periodHistory = history.filter(entry => 
    new Date(entry.date) >= startDate && new Date(entry.date) <= now
  );
  
  // If we don't have enough data, return a stable trend
  if (periodHistory.length < 2) {
    return {
      period: `${days}d` as '30d' | '60d' | '90d',
      startScore: periodHistory[0]?.score || 0,
      endScore: periodHistory[0]?.score || 0,
      change: 0,
      direction: 'stable'
    };
  }
  
  // Sort by date
  const sortedHistory = [...periodHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const startScore = sortedHistory[0].score;
  const endScore = sortedHistory[sortedHistory.length - 1].score;
  const change = endScore - startScore;
  
  return {
    period: `${days}d` as '30d' | '60d' | '90d',
    startScore,
    endScore,
    change,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
  };
};

// Get or create student health data
export const getStudentHealthData = (studentId: string): StudentHealth.StudentHealthData => {
  // Try to load existing data
  const existingData = loadData<StudentHealth.StudentHealthData>(
    `${STORAGE_KEYS.STUDENT_HEALTH}_${studentId}`,
    null
  );
  
  if (existingData) {
    return existingData;
  }
  
  // Create new default data if none exists
  const defaultFactors: StudentHealth.HealthScoreFactors = {
    engagement: 50,
    progress: 50,
    sentiment: 50,
    attendance: 50,
    completion: 50
  };
  
  const defaultScore = calculateHealthScore(defaultFactors);
  const riskCategory = getRiskCategory(defaultScore);
  
  const newData: StudentHealth.StudentHealthData = {
    studentId,
    currentScore: defaultScore,
    riskLevel: riskCategory.level,
    lastUpdated: new Date().toISOString(),
    factors: defaultFactors,
    history: [{
      date: new Date().toISOString(),
      score: defaultScore,
      factors: defaultFactors
    }],
    trends: {
      '30d': {
        period: '30d',
        startScore: defaultScore,
        endScore: defaultScore,
        change: 0,
        direction: 'stable'
      },
      '60d': {
        period: '60d',
        startScore: defaultScore,
        endScore: defaultScore,
        change: 0,
        direction: 'stable'
      },
      '90d': {
        period: '90d',
        startScore: defaultScore,
        endScore: defaultScore,
        change: 0,
        direction: 'stable'
      }
    }
  };
  
  return newData;
};

// Update student health data based on bi-weekly notes
export const updateHealthFromNotes = (
  studentId: string, 
  notes: any[]
): StudentHealth.StudentHealthData => {
  // Get current health data
  const healthData = getStudentHealthData(studentId);
  
  if (!notes || notes.length === 0) {
    return healthData;
  }
  
  // Extract factors from notes
  const factors = extractFactorsFromNotes(notes);
  
  // Calculate new score
  const newScore = calculateHealthScore(factors);
  const riskCategory = getRiskCategory(newScore);
  
  // Create new history entry
  const newHistoryEntry: StudentHealth.HealthScoreHistory = {
    date: new Date().toISOString(),
    score: newScore,
    factors,
    notes: notes[0]?.updatesInteractions
  };
  
  // Update health data
  const updatedData: StudentHealth.StudentHealthData = {
    ...healthData,
    currentScore: newScore,
    riskLevel: riskCategory.level,
    lastUpdated: new Date().toISOString(),
    factors,
    history: [newHistoryEntry, ...healthData.history].slice(0, 100), // Keep last 100 entries
  };
  
  // Recalculate trends
  updatedData.trends = {
    '30d': calculateTrend(updatedData.history, 30),
    '60d': calculateTrend(updatedData.history, 60),
    '90d': calculateTrend(updatedData.history, 90)
  };
  
  // Save the updated data
  saveData(`${STORAGE_KEYS.STUDENT_HEALTH}_${studentId}`, updatedData);
  
  return updatedData;
};

// Add a constant for storage keys
export const STUDENT_HEALTH_STORAGE_KEY = 'student_health';

// Save the health score data to storage
export const saveHealthScoreData = (data: StudentHealth.StudentHealthData): void => {
  saveData(`${STORAGE_KEYS.STUDENT_HEALTH}_${data.studentId}`, data);
};
