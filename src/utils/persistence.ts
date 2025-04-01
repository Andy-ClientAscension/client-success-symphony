
/**
 * Utility for persisting dashboard data in localStorage
 */

// Keys for different types of data
const STORAGE_KEYS = {
  CLIENTS: "clientsData",
  SETTINGS: "appSettings",
  DASHBOARD: "dashboardLayout",
  THEME: "theme",
  KANBAN: "kanbanBoard",
  CLIENT_NOTES: "clientNotes",
  CLIENT_STATUS: "clientStatus",
  CHURN: "churnData",
  USER_PREFERENCES: "userPreferences",
  CUSTOM_FIELDS: "customFields",
  CLIENT_CUSTOM_FIELDS: "clientCustomFields",
  TASKS: "tasksList",
  HEALTH_SCORES: "clientHealthScores"
};

/**
 * Saves data to localStorage
 * @param key The key to save under
 * @param data The data to save
 */
export const saveData = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    console.log(`Saved data for key: ${key}`);
  } catch (error) {
    console.error(`Error saving data for key: ${key}`, error);
  }
};

/**
 * Loads data from localStorage
 * @param key The key to load from
 * @param defaultValue Default value if no data exists
 * @returns The loaded data or the default value
 */
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading data for key: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Clears all saved dashboard data
 */
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All dashboard data cleared');
};

/**
 * Save user preferences
 */
export const saveUserPreferences = (preferences: {
  theme?: 'light' | 'dark' | 'system';
  layout?: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed?: boolean;
  dateFormat?: string;
  currency?: string;
}): void => {
  const current = loadData(STORAGE_KEYS.USER_PREFERENCES, {});
  saveData(STORAGE_KEYS.USER_PREFERENCES, { ...current, ...preferences });
};

/**
 * Load user preferences
 */
export const loadUserPreferences = () => {
  return loadData(STORAGE_KEYS.USER_PREFERENCES, {
    theme: 'system',
    layout: 'comfortable',
    sidebarCollapsed: false,
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD'
  });
};

/**
 * Save analytics metrics
 */
export const saveAnalyticsData = (data: any): void => {
  saveData(STORAGE_KEYS.CLIENTS, data);
};

/**
 * Get analytics metrics
 */
export const getAnalyticsData = () => {
  return loadData(STORAGE_KEYS.CLIENTS, {});
};

/**
 * Save health score for a client
 */
export const saveHealthScore = (healthScoreData: {
  id: string;
  clientId: string;
  clientName: string;
  team: string;
  csm: string;
  score: number;
  updatesInteractions?: string;
  wins?: string;
  struggles?: string;
  outreachChannels?: string;
  bookedCalls?: number;
  notes: string;
  date: string;
}): void => {
  const currentScores = loadData<any[]>(STORAGE_KEYS.HEALTH_SCORES, []);
  
  // Check if this is an update to an existing score
  const existingIndex = currentScores.findIndex(score => score.id === healthScoreData.id);
  
  if (existingIndex >= 0) {
    // Update existing score
    currentScores[existingIndex] = healthScoreData;
  } else {
    // Add new score
    currentScores.push(healthScoreData);
  }
  
  saveData(STORAGE_KEYS.HEALTH_SCORES, currentScores);
};

/**
 * Get health scores for all clients or filtered by client ID
 */
export const getHealthScores = (clientId?: string) => {
  const scores = loadData<any[]>(STORAGE_KEYS.HEALTH_SCORES, []);
  
  if (clientId) {
    return scores.filter(score => score.clientId === clientId);
  }
  
  return scores;
};

// Export storage keys for use in components
export { STORAGE_KEYS };
