
import { DashboardSectionKey as DashboardSectionKeyType } from "./types";

export const ADDITIONAL_TEAMS = [
  { id: 'Enterprise', name: 'Enterprise' },
  { id: 'SMB', name: 'SMB' },
  { id: 'Mid-Market', name: 'Mid-Market' },
  { id: 'Team-Andy', name: 'Team Andy' },
  { id: 'Team-Chris', name: 'Team Chris' }
];

export const defaultSections = [
  { key: 'metrics' as DashboardSectionKeyType, label: 'Metrics Overview' },
  { key: 'clients' as DashboardSectionKeyType, label: 'Client Distribution' },
  { key: 'performance' as DashboardSectionKeyType, label: 'Performance' },
  { key: 'health' as DashboardSectionKeyType, label: 'Health Scores' },
];

// Use export type to resolve the TypeScript error
export type { DashboardSectionKey } from './types';
