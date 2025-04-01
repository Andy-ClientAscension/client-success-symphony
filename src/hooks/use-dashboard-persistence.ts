
import { useState, useEffect } from 'react';
import { STORAGE_KEYS, saveData, loadData } from '@/utils/persistence';

/**
 * Hook for managing dashboard persistence preferences
 * Controls whether dashboard data should be saved between sessions
 */
export function useDashboardPersistence() {
  const [persistDashboard, setPersistDashboard] = useState<boolean>(
    loadData(STORAGE_KEYS.USER_PREFERENCES, {}).persistDashboard ?? false
  );

  // Load initial state from local storage
  useEffect(() => {
    const preferences = loadData(STORAGE_KEYS.USER_PREFERENCES, {});
    setPersistDashboard(preferences.persistDashboard ?? false);
  }, []);
  
  // Toggle persistence state and save to local storage
  const togglePersistDashboard = () => {
    const newState = !persistDashboard;
    setPersistDashboard(newState);
    
    // Update the user preferences in local storage
    const currentPreferences = loadData(STORAGE_KEYS.USER_PREFERENCES, {});
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
