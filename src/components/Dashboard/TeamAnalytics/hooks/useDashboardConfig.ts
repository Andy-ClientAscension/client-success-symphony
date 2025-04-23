
import { useState, useEffect } from 'react';
import { DashboardSectionKey } from '../types';
import { defaultSections, ADDITIONAL_TEAMS } from '../constants';

interface DashboardConfig {
  visibleSections: DashboardSectionKey[];
  expandedSections: DashboardSectionKey[];
  selectedTeam: string;
}

export function useDashboardConfig(userId: string = 'default') {
  // Initialize from localStorage if available, otherwise use defaults
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const savedConfig = localStorage.getItem(`dashboard-config-${userId}`);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved dashboard configuration');
      }
    }
    
    // Default configuration
    return {
      visibleSections: defaultSections.map(section => section.key),
      expandedSections: ['metrics'] as DashboardSectionKey[], // Only expand metrics by default
      selectedTeam: 'Enterprise', // Default team
    };
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem(`dashboard-config-${userId}`, JSON.stringify(config));
  }, [config, userId]);

  const toggleSectionExpansion = (sectionKey: DashboardSectionKey, isExpanded: boolean) => {
    setConfig(prev => ({
      ...prev,
      expandedSections: isExpanded 
        ? [...prev.expandedSections, sectionKey]
        : prev.expandedSections.filter(key => key !== sectionKey)
    }));
  };

  const removeSection = (sectionKey: DashboardSectionKey) => {
    setConfig(prev => ({
      ...prev,
      visibleSections: prev.visibleSections.filter(key => key !== sectionKey)
    }));
  };

  const addSection = (sectionKey: DashboardSectionKey) => {
    if (!config.visibleSections.includes(sectionKey)) {
      setConfig(prev => ({
        ...prev,
        visibleSections: [...prev.visibleSections, sectionKey]
      }));
    }
  };

  const changeTeam = (teamId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedTeam: teamId
    }));
  };

  const resetToDefaults = () => {
    const defaultConfig: DashboardConfig = {
      visibleSections: defaultSections.map(section => section.key),
      expandedSections: ['metrics'] as DashboardSectionKey[],
      selectedTeam: 'Enterprise',
    };
    
    setConfig(defaultConfig);
  };

  // Generate shareable configuration URL
  const getShareableConfigUrl = () => {
    const configParam = encodeURIComponent(JSON.stringify({
      v: config.visibleSections,
      e: config.expandedSections,
      t: config.selectedTeam
    }));
    
    return `${window.location.origin}${window.location.pathname}?config=${configParam}`;
  };

  // Import configuration from URL or JSON
  const importConfig = (configData: string) => {
    try {
      const parsedConfig = JSON.parse(configData);
      if (parsedConfig.visibleSections && Array.isArray(parsedConfig.visibleSections) && 
          parsedConfig.expandedSections && Array.isArray(parsedConfig.expandedSections) &&
          parsedConfig.selectedTeam) {
        setConfig(parsedConfig);
        return true;
      }
    } catch (e) {
      console.error('Failed to import dashboard configuration', e);
    }
    return false;
  };

  return {
    config,
    toggleSectionExpansion,
    removeSection,
    addSection,
    changeTeam,
    resetToDefaults,
    getShareableConfigUrl,
    importConfig,
    availableTeams: [
      { id: 'all', name: 'All Teams' },
      ...ADDITIONAL_TEAMS
    ],
    availableSections: defaultSections.map(section => ({
      key: section.key,
      label: section.label,
      isVisible: config.visibleSections.includes(section.key)
    }))
  };
}
