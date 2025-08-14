// Standardized state management patterns for the application
// This provides consistent patterns for managing different types of state

import { useCallback, useReducer, useRef, useEffect } from 'react';
import { errorService } from '../services/error-service';

// ===== ASYNC STATE MANAGEMENT =====

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export type AsyncAction<T> =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: T }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

export function asyncReducer<T>(
  state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'SUCCESS':
      return {
        data: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      };
    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'RESET':
      return {
        data: null,
        isLoading: false,
        error: null,
        lastUpdated: null
      };
    default:
      return state;
  }
}

export function useAsyncState<T>(initialData: T | null = null) {
  const [state, dispatch] = useReducer(asyncReducer<T>, {
    data: initialData,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const result = await asyncFunction();
      dispatch({ type: 'SUCCESS', payload: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'ERROR', payload: errorMessage });
      
      // Log error through error service
      errorService.handleError(error as Error, {
        component: 'useAsyncState',
        action: 'execute'
      });
      
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// ===== FORM STATE MANAGEMENT =====

export interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export type FormAction<T extends Record<string, any>> =
  | { type: 'SET_FIELD_VALUE'; field: keyof T; value: any }
  | { type: 'SET_FIELD_ERROR'; field: keyof T; error: string | null }
  | { type: 'SET_FIELD_TOUCHED'; field: keyof T; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'RESET_FORM'; initialValues: T }
  | { type: 'VALIDATE_FORM' };

export function formReducer<T extends Record<string, any>>(
  state: FormState<T>,
  action: FormAction<T>
): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: {
            ...state.fields[action.field],
            value: action.value,
            dirty: true
          }
        }
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: {
            ...state.fields[action.field],
            error: action.error
          }
        }
      };
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: {
            ...state.fields[action.field],
            touched: action.touched
          }
        }
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };
    case 'SUBMIT_ATTEMPT':
      return {
        ...state,
        submitCount: state.submitCount + 1
      };
    case 'RESET_FORM':
      const resetFields = {} as { [K in keyof T]: FormField };
      Object.keys(action.initialValues).forEach(key => {
        resetFields[key as keyof T] = {
          value: action.initialValues[key],
          error: null,
          touched: false,
          dirty: false
        };
      });
      return {
        fields: resetFields,
        isValid: true,
        isSubmitting: false,
        submitCount: 0
      };
    case 'VALIDATE_FORM':
      const hasErrors = Object.values(state.fields).some(field => field.error !== null);
      return {
        ...state,
        isValid: !hasErrors
      };
    default:
      return state;
  }
}

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validate, onSubmit } = options;
  
  // Initialize form state
  const initialFields = {} as { [K in keyof T]: FormField };
  Object.keys(initialValues).forEach(key => {
    initialFields[key as keyof T] = {
      value: initialValues[key],
      error: null,
      touched: false,
      dirty: false
    };
  });

  const [state, dispatch] = useReducer(formReducer<T>, {
    fields: initialFields,
    isValid: true,
    isSubmitting: false,
    submitCount: 0
  });

  // Get current form values
  const values = Object.keys(state.fields).reduce((acc, key) => {
    acc[key as keyof T] = state.fields[key as keyof T].value;
    return acc;
  }, {} as T);

  // Field handlers
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', field, value });
    
    // Validate field if validator provided
    if (validate) {
      const errors = validate({ ...values, [field]: value });
      dispatch({ type: 'SET_FIELD_ERROR', field, error: errors[field] || null });
    }
    
    dispatch({ type: 'VALIDATE_FORM' });
  }, [validate, values]);

  const setFieldTouched = useCallback((field: keyof T, touched = true) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', field, touched });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM', initialValues });
  }, [initialValues]);

  // Submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    dispatch({ type: 'SUBMIT_ATTEMPT' });
    
    // Touch all fields
    Object.keys(state.fields).forEach(field => {
      setFieldTouched(field as keyof T, true);
    });

    // Validate all fields
    if (validate) {
      const errors = validate(values);
      Object.keys(errors).forEach(field => {
        dispatch({ type: 'SET_FIELD_ERROR', field: field as keyof T, error: errors[field as keyof T] || null });
      });
    }

    dispatch({ type: 'VALIDATE_FORM' });

    if (!state.isValid) {
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await onSubmit(values);
    } catch (error) {
      errorService.handleError(error as Error, {
        component: 'useForm',
        action: 'submit'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [state, values, validate, onSubmit, setFieldTouched]);

  return {
    values,
    errors: Object.keys(state.fields).reduce((acc, key) => {
      acc[key as keyof T] = state.fields[key as keyof T].error;
      return acc;
    }, {} as Partial<Record<keyof T, string | null>>),
    touched: Object.keys(state.fields).reduce((acc, key) => {
      acc[key as keyof T] = state.fields[key as keyof T].touched;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>),
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    submitCount: state.submitCount,
    setFieldValue,
    setFieldTouched,
    resetForm,
    handleSubmit
  };
}

// ===== PAGINATION STATE =====

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function usePagination(initialPageSize = 10) {
  const [state, setState] = useReducer(
    (prev: PaginationState, updates: Partial<PaginationState>) => ({
      ...prev,
      ...updates,
      totalPages: Math.ceil((updates.totalItems ?? prev.totalItems) / (updates.pageSize ?? prev.pageSize))
    }),
    {
      currentPage: 1,
      pageSize: initialPageSize,
      totalItems: 0,
      totalPages: 0
    }
  );

  const setPage = useCallback((page: number) => {
    setState({ currentPage: Math.max(1, Math.min(page, state.totalPages)) });
  }, [state.totalPages]);

  const setPageSize = useCallback((pageSize: number) => {
    setState({ pageSize, currentPage: 1 });
  }, []);

  const setTotalItems = useCallback((totalItems: number) => {
    setState({ totalItems });
  }, []);

  const nextPage = useCallback(() => {
    setPage(state.currentPage + 1);
  }, [state.currentPage, setPage]);

  const prevPage = useCallback(() => {
    setPage(state.currentPage - 1);
  }, [state.currentPage, setPage]);

  return {
    ...state,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    hasNextPage: state.currentPage < state.totalPages,
    hasPrevPage: state.currentPage > 1
  };
}

// ===== OPTIMISTIC UPDATES =====

export function useOptimisticState<T>(
  initialValue: T,
  updateFn: (optimisticValue: T) => Promise<T>
) {
  const [state, setState] = useReducer(
    (prev: { current: T; pending: T | null; error: string | null }, action: any) => {
      switch (action.type) {
        case 'SET_OPTIMISTIC':
          return { current: action.value, pending: action.value, error: null };
        case 'CONFIRM':
          return { current: action.value, pending: null, error: null };
        case 'REVERT':
          return { current: prev.current, pending: null, error: action.error };
        default:
          return prev;
      }
    },
    { current: initialValue, pending: null, error: null }
  );

  const updateOptimistically = useCallback(async (optimisticValue: T) => {
    setState({ type: 'SET_OPTIMISTIC', value: optimisticValue });
    
    try {
      const actualValue = await updateFn(optimisticValue);
      setState({ type: 'CONFIRM', value: actualValue });
      return actualValue;
    } catch (error) {
      setState({ type: 'REVERT', error: error instanceof Error ? error.message : 'Update failed' });
      throw error;
    }
  }, [updateFn]);

  return {
    value: state.pending ?? state.current,
    isPending: state.pending !== null,
    error: state.error,
    updateOptimistically
  };
}