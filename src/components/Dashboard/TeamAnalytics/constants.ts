
import { DashboardSectionKey } from "./types";

export const ADDITIONAL_TEAMS = [
  { id: 'Enterprise', name: 'Enterprise' },
  { id: 'SMB', name: 'SMB' },
  { id: 'Mid-Market', name: 'Mid-Market' },
  { id: 'Team-Andy', name: 'Team Andy' },
  { id: 'Team-Chris', name: 'Team Chris' }
];

export const defaultSections = [
  { key: 'metrics' as DashboardSectionKey, label: 'Metrics Overview' },
  { key: 'clients' as DashboardSectionKey, label: 'Client Distribution' },
  { key: 'performance' as DashboardSectionKey, label: 'Performance' },
  { key: 'health' as DashboardSectionKey, label: 'Health Scores' },
];

// Re-export the DashboardSectionKey type so it can be imported directly from constants
export { DashboardSectionKey } from './types';
