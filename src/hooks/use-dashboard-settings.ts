
import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadData, saveData } from '@/utils/persistence';

export interface DashboardSettings {
  layout: 'compact' | 'comfortable' | 'spacious';
  showWelcomeMessage: boolean;
  defaultView: 'kanban' | 'list' | 'analytics';
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  columnOrder: string[];
  visibleColumns: string[];
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: DashboardSettings = {
  layout: 'comfortable',
  showWelcomeMessage: true,
  defaultView: 'kanban',
  autoRefresh: true,
  refreshInterval: 5,
  columnOrder: ['new', 'active', 'at-risk', 'backend', 'olympia', 'paused', 'churned', 'graduated'],
  visibleColumns: ['new', 'active', 'at-risk', 'backend', 'olympia', 'paused', 'churned', 'graduated'],
  theme: 'system'
};

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    return loadData<DashboardSettings>(STORAGE_KEYS.DASHBOARD, DEFAULT_SETTINGS);
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // On mount, load settings from localStorage
    const savedSettings = loadData<DashboardSettings>(STORAGE_KEYS.DASHBOARD, DEFAULT_SETTINGS);
    setSettings(savedSettings);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    if (isLoaded) {
      saveData(STORAGE_KEYS.DASHBOARD, settings);
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded
  };
}
