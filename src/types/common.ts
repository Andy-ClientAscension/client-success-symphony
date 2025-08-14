/**
 * Comprehensive Type Definitions
 * Centralized types to eliminate any/unknown usage
 */

// Common utility types
export type StringRecord = Record<string, string>;
export type AnyRecord = Record<string, any>;
export type UnknownRecord = Record<string, unknown>;

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: Error | null;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

// Form Types
export interface FormSubmissionData {
  [key: string]: string | number | boolean | Date | null | undefined | any[] | Record<string, any>;
}

export interface FormHandler<T extends FormSubmissionData = FormSubmissionData> {
  onSubmit: (data: T) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Dashboard Types
export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  conversionRate: number;
  revenue: number;
  growthRate: number;
  [key: string]: number | string;
}

export interface StatusCounts {
  lead: number;
  prospect: number;
  initialCall: number;
  followUp: number;
  proposalSent: number;
  negotiation: number;
  closedWon: number;
  closedLost: number;
  nurture: number;
}

export interface PerformanceData {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  team?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContact?: Date;
  value?: number;
}

export interface ClientMetrics {
  totalValue: number;
  avgValue: number;
  conversionRate: number;
  averageDealTime: number;
  clientSatisfaction: number;
}

// Student/Team Types
export interface Student {
  id: string;
  name: string;
  email: string;
  team?: string;
  status: string;
  notes?: string;
  healthScore?: number;
  lastActivity?: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  performance: number;
  clientsAssigned: number;
  revenue: number;
  satisfaction: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  performance: PerformanceData[];
  metrics: DashboardMetrics;
}

// Event Handler Types
export interface DragEndResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

export interface FilterOptions {
  status?: string[];
  team?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

// Webhook/Integration Types
export interface WebhookConfig {
  id: string;
  service: string;
  url: string;
  enabled: boolean;
  events: string[];
  headers?: StringRecord;
}

export interface AutomationWebhook extends WebhookConfig {
  name?: string;
  lastTriggered?: Date | string | null;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
}

// AI/Insights Types
export interface AIInsight {
  id: string;
  type: 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  metadata?: UnknownRecord;
}

export interface AIMetrics {
  totalInsights: number;
  highPriorityAlerts: number;
  trends: AIInsight[];
  recommendations: AIInsight[];
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TooltipData {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

// Storage Types
export interface CachedData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface StorageItem<T = any> {
  value: T;
  encrypted: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Error Types (enhanced)
export interface DetailedError {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  code?: string;
  status?: number;
  timestamp: Date;
  context?: UnknownRecord;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: DetailedError;
  errorId?: string;
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
}

export interface BenchmarkResult {
  name: string;
  duration: number;
  iterations: number;
  opsPerSecond: number;
  variance: number;
}

// Type Guards
export function isValidClient(obj: unknown): obj is Client {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof (obj as any).id === 'string' &&
         typeof (obj as any).name === 'string' &&
         typeof (obj as any).email === 'string';
}

export function isApiError(obj: unknown): obj is ApiError {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof (obj as any).message === 'string';
}

export function isDragEndResult(obj: unknown): obj is DragEndResult {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof (obj as any).draggableId === 'string' &&
         typeof (obj as any).source === 'object';
}