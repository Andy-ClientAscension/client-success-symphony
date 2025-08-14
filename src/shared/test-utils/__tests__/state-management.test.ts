import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncState, useForm, usePagination } from '../../../shared/hooks/state-management';

describe('State Management Hooks', () => {
  describe('useAsyncState', () => {
    it('should initialize with correct initial state', () => {
      const { result } = renderHook(() => useAsyncState());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
    });

    it('should handle successful async operation', async () => {
      const { result } = renderHook(() => useAsyncState<string>());
      
      const mockAsyncFn = vi.fn().mockResolvedValue('test data');
      
      await act(async () => {
        await result.current.execute(mockAsyncFn);
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe('test data');
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle async operation errors', async () => {
      const { result } = renderHook(() => useAsyncState<string>());
      
      const mockError = new Error('Test error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      try {
        await act(async () => {
          await result.current.execute(mockAsyncFn);
        });
      } catch (error) {
        // Error is expected to be thrown
      }
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Test error');
    });

    it('should reset state', () => {
      const { result } = renderHook(() => useAsyncState<string>('initial'));
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastUpdated).toBeNull();
    });
  });

  describe('useForm', () => {
    const initialValues = { name: '', email: '' };
    
    it('should initialize with provided values', () => {
      const { result } = renderHook(() => useForm({
        initialValues,
        onSubmit: vi.fn()
      }));
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitCount).toBe(0);
    });

    it('should update field values', () => {
      const { result } = renderHook(() => useForm({
        initialValues,
        onSubmit: vi.fn()
      }));
      
      act(() => {
        result.current.setFieldValue('name', 'John Doe');
      });
      
      expect(result.current.values.name).toBe('John Doe');
      expect(result.current.touched.name).toBe(true);
    });

    it('should validate fields', () => {
      const validator = vi.fn().mockReturnValue({
        name: 'Name is required',
        email: 'Email is required'
      });
      
      const { result } = renderHook(() => useForm({
        initialValues,
        validate: validator,
        onSubmit: vi.fn()
      }));
      
      act(() => {
        result.current.setFieldValue('name', '');
      });
      
      expect(validator).toHaveBeenCalled();
      expect(result.current.errors.name).toBe('Name is required');
    });

    it('should handle form submission', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        onSubmit: mockSubmit
      }));
      
      await act(async () => {
        await result.current.handleSubmit();
      });
      
      expect(mockSubmit).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com' });
      expect(result.current.submitCount).toBe(1);
    });

    it('should reset form', () => {
      const { result } = renderHook(() => useForm({
        initialValues,
        onSubmit: vi.fn()
      }));
      
      act(() => {
        result.current.setFieldValue('name', 'John');
      });
      
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.touched.name).toBe(false);
    });
  });

  describe('usePagination', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination());
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    it('should initialize with custom page size', () => {
      const { result } = renderHook(() => usePagination(20));
      
      expect(result.current.pageSize).toBe(20);
    });

    it('should change pages within bounds', () => {
      const { result } = renderHook(() => usePagination(10));
      
      act(() => {
        result.current.setTotalItems(100);
      });
      
      act(() => {
        result.current.setPage(3);
      });
      
      expect(result.current.currentPage).toBe(3);
      expect(result.current.totalPages).toBe(10);
    });

    it('should not go beyond page bounds', () => {
      const { result } = renderHook(() => usePagination(10));
      
      act(() => {
        result.current.setTotalItems(50);
      });
      
      // Try to go beyond last page
      act(() => {
        result.current.setPage(10);
      });
      
      expect(result.current.currentPage).toBe(5); // Should stay at last page
      
      // Try to go before first page
      act(() => {
        result.current.setPage(0);
      });
      
      expect(result.current.currentPage).toBe(1); // Should stay at first page
    });

    it('should navigate to next and previous pages', () => {
      const { result } = renderHook(() => usePagination(10));
      
      act(() => {
        result.current.setTotalItems(100);
      });
      
      act(() => {
        result.current.nextPage();
      });
      
      expect(result.current.currentPage).toBe(2);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPrevPage).toBe(true);
      
      act(() => {
        result.current.prevPage();
      });
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPrevPage).toBe(false);
    });

    it('should update page size and reset to first page', () => {
      const { result } = renderHook(() => usePagination(10));
      
      act(() => {
        result.current.setTotalItems(100);
        result.current.setPage(5);
      });
      
      act(() => {
        result.current.setPageSize(20);
      });
      
      expect(result.current.pageSize).toBe(20);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(5);
    });
  });
});