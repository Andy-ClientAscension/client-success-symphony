// Comprehensive TypeScript configuration for the refactor
// This will be the foundation for type safety across the application

// ===== CORE DOMAIN TYPES =====

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'user';

export interface Client extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  team?: string;
  csm?: string;
  mrr: number;
  npsScore?: number;
  progress: number;
  dealsClosed?: number;
  callsBooked?: number;
  nextCallDate?: Date;
  lastContactDate?: Date;
  notes?: string;
  tags?: string[];
}

export type ClientStatus = 'new' | 'active' | 'at-risk' | 'churned' | 'paused';

// ===== API TYPES =====

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== COMPONENT TYPES =====

export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
  lastUpdated?: Date;
}

// ===== FORM TYPES =====

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule<T>[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// ===== EVENT TYPES =====

export interface AppEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source?: string;
}

export type EventHandler<T = any> = (event: AppEvent<T>) => void;

// ===== STORAGE TYPES =====

export interface StorageItem<T = any> {
  key: string;
  value: T;
  expiresAt?: Date;
  version?: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number;
  staleWhileRevalidate?: boolean;
}

// ===== ANALYTICS TYPES =====

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// ===== UTILITY TYPES =====

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Brand types for better type safety
export type Brand<T, TBrand> = T & { __brand: TBrand };
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type Currency = Brand<number, 'Currency'>;

// ===== HOOK TYPES =====

export interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retry?: number;
  retryDelay?: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  maxPageSize?: number;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  enableReinitialize?: boolean;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// ===== ROUTE TYPES =====

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: UserRole[];
  title?: string;
  description?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ComponentType;
  children?: NavigationItem[];
  roles?: UserRole[];
}

// ===== THEME TYPES =====

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// ===== FEATURE FLAG TYPES =====

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  variants?: Record<string, any>;
  conditions?: FeatureFlagCondition[];
}

export interface FeatureFlagCondition {
  type: 'user' | 'role' | 'percentage' | 'date';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

// ===== ERROR TYPES =====

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorRecoveryOptions {
  retry?: () => void;
  reset?: () => void;
  fallback?: React.ComponentType;
}

// Types are already exported above, no need to re-export