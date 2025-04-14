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
  HEALTH_SCORES: "clientHealthScores",
  IMPORTED_DATA: "importedData"
};

/**
 * Validates data being stored (basic type checking)
 * @param data The data to validate
 * @returns Whether the data is valid
 */
const validateData = <T>(data: T): boolean => {
  if (data === undefined || data === null) {
    return false;
  }
  
  // Validate arrays have proper structure
  if (Array.isArray(data)) {
    return true; // We trust array content for now
  }
  
  // Validate objects have proper structure
  if (typeof data === 'object') {
    return true; // We trust object structure for now
  }
  
  return true;
};

/**
 * Safely parse JSON with error handling
 */
const safeJSONParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    return defaultValue;
  }
};

/**
 * Saves data to localStorage with validation
 * @param key The key to save under
 * @param data The data to save
 */
export const saveData = <T>(key: string, data: T): void => {
  try {
    if (!validateData(data)) {
      console.warn(`Validation failed for data with key: ${key}`);
      return;
    }
    
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    
    // Dispatch a storage event so other components can react to the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: serializedData,
      storageArea: localStorage
    }));
    
    console.log(`Saved data for key: ${key}`);
  } catch (error) {
    console.error(`Error saving data for key: ${key}`, error);
  }
};

/**
 * Loads data from localStorage with enhanced error handling
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
    
    const parsedData = safeJSONParse<T>(serializedData, defaultValue);
    
    // If we got invalid data back, return the default
    if (!validateData(parsedData)) {
      console.warn(`Invalid data loaded for key: ${key}, using default value`);
      return defaultValue;
    }
    
    return parsedData;
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
  
  // Log the data change to imported data history
  const importHistory = loadData<{timestamp: string, count: number}[]>(STORAGE_KEYS.IMPORTED_DATA, []);
  
  importHistory.push({
    timestamp: new Date().toISOString(),
    count: Object.keys(data).length
  });
  
  // Keep only the last 10 import records
  if (importHistory.length > 10) {
    importHistory.splice(0, importHistory.length - 10);
  }
  
  saveData(STORAGE_KEYS.IMPORTED_DATA, importHistory);
};

/**
 * Get analytics metrics
 */
export const getAnalyticsData = () => {
  return loadData(STORAGE_KEYS.CLIENTS, {});
};

/**
 * Get import history
 */
export const getImportHistory = () => {
  return loadData<{timestamp: string, count: number}[]>(STORAGE_KEYS.IMPORTED_DATA, []);
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
