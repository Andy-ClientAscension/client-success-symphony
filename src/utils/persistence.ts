
/**
 * Utility for persisting dashboard data in localStorage
 */

// Keys for different types of data
const STORAGE_KEYS = {
  CLIENTS: 'ssc-dashboard-clients',
  KANBAN: 'ssc-dashboard-kanban',
  METRICS: 'ssc-dashboard-metrics',
  NPS: 'ssc-dashboard-nps',
  CHURN: 'ssc-dashboard-churn',
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

// Export storage keys for use in components
export { STORAGE_KEYS };
