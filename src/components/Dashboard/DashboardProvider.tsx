import React, { createContext, useContext, useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardContextType {
  // Team selection
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  
  // Dashboard data
  dashboardData: ReturnType<typeof useDashboardData>;
  
  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: React.ReactNode;
  initialTeam?: string;
  initialTab?: string;
}

export function DashboardProvider({ 
  children, 
  initialTeam = 'all',
  initialTab = 'overview' 
}: DashboardProviderProps) {
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Use the unified dashboard data hook with team filtering
  const dashboardData = useDashboardData({ 
    teamFilter: selectedTeam,
    enableAutoSync: true 
  });

  const contextValue: DashboardContextType = {
    selectedTeam,
    setSelectedTeam,
    dashboardData,
    activeTab,
    setActiveTab,
    isExpanded,
    setIsExpanded,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}