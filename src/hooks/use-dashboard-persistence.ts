
import { useState, useEffect } from 'react';
import { STORAGE_KEYS, saveData, loadData } from '@/utils/persistence';

/**
 * Hook for managing dashboard persistence preferences
 * Controls whether dashboard data should be saved between sessions
 */
export function useDashboardPersistence() {
  // Define a type for the user preferences
  interface UserPreferences {
    persistDashboard?: boolean;
    [key: string]: any;
  }

  const [persistDashboard, setPersistDashboard] = useState<boolean>(() => {
    const prefs = loadData<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
    return prefs.persistDashboard ?? false;
  });

  // Load initial state from local storage
  useEffect(() => {
    const preferences = loadData<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
    setPersistDashboard(preferences.persistDashboard ?? false);
  }, []);
  
  // Toggle persistence state and save to local storage
  const togglePersistDashboard = () => {
    const newState = !persistDashboard;
    setPersistDashboard(newState);
    
    // Update the user preferences in local storage
    const currentPreferences = loadData<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
    saveData(STORAGE_KEYS.USER_PREFERENCES, {
      ...currentPreferences,
      persistDashboard: newState
    });
  };
  
  return {
    persistDashboard,
    togglePersistDashboard
  };
}
