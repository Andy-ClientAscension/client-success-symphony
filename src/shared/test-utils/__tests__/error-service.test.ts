import { describe, expect, it, vi, beforeEach } from 'vitest';
import { errorService } from '../../../shared/services/error-service';
import { createMockError } from '../test-data-factories';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Error Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    errorService.clearErrors();
  });

  describe('error handling', () => {
    it('should handle and log errors', () => {
      const error = createMockError({ message: 'Test error' });
      
      errorService.handleError(error, { component: 'Test Component' });
    });

    it('should track error statistics', () => {
      const error1 = createMockError({ message: 'Error 1' });
      const error2 = createMockError({ message: 'Error 2' });
      
      errorService.handleError(error1, { component: 'Component1' });
      errorService.handleError(error2, { component: 'Component2' });
      
      const stats = errorService.getErrorStats();
      expect(stats.total).toBe(2);
      expect(stats.byComponent.Component1).toBe(1);
      expect(stats.byComponent.Component2).toBe(1);
    });

    it('should categorize errors by severity', () => {
      const networkError = new Error('Failed to fetch');
      const validationError = new Error('Validation failed');
      
      errorService.handleError(networkError, { component: 'API', severity: 'high' });
      errorService.handleError(validationError, { component: 'Form', severity: 'medium' });
      
      const stats = errorService.getErrorStats();
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
    });

    it('should store recent errors', () => {
      const error = createMockError({ message: 'Recent error' });
      
      errorService.handleError(error, { component: 'TestComponent' });
      
      const stats = errorService.getErrorStats();
      expect(stats.recent).toHaveLength(1);
      expect(stats.recent[0].message).toBe('Recent error');
      expect(stats.recent[0].context?.component).toBe('TestComponent');
    });
  });

  describe('error creation', () => {
    it('should create standardized errors', () => {
      const error = errorService.createError(
        'Test error message',
        { 
          code: 'VALIDATION_ERROR',
          context: { metadata: { field: 'email' } }
        }
      );
      
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context?.metadata?.field).toBe('email');
    });

    it('should create errors with default values', () => {
      const error = errorService.createError('Simple error');
      
      expect(error.message).toBe('Simple error');
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('error boundaries', () => {
    it('should handle async errors', async () => {
      const asyncError = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(asyncError);
      
      const result = await errorService.withErrorHandling(asyncFn, { component: 'AsyncComponent' });
      
      expect(result).toBeUndefined();
    });

    it('should handle sync errors', () => {
      const syncError = new Error('Sync error');
      const syncFn = vi.fn().mockImplementation(() => {
        throw syncError;
      });
      
      const result = errorService.withSyncErrorHandling(syncFn, { component: 'SyncComponent' });
      
      expect(result).toBeUndefined();
    });

    it('should return results for successful operations', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      
      const result = await errorService.withErrorHandling(successFn, { component: 'Component' });
      
      expect(result).toBe('success');
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('error listeners', () => {
    it('should register and call error listeners', () => {
      const listener = vi.fn();
      const unsubscribe = errorService.onError(listener);
      
      const error = createMockError({ message: 'Listener test' });
      errorService.handleError(error, { component: 'TestComponent' });
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Listener test',
          context: expect.objectContaining({
            component: 'TestComponent'
          })
        })
      );
      
      unsubscribe();
    });

    it('should unsubscribe error listeners', () => {
      const listener = vi.fn();
      const unsubscribe = errorService.onError(listener);
      
      unsubscribe();
      
      const error = createMockError({ message: 'After unsubscribe' });
      errorService.handleError(error, { component: 'TestComponent' });
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('error stats', () => {
    it('should clear all errors', () => {
      const error = createMockError({ message: 'Test error' });
      errorService.handleError(error, { component: 'Component' });
      
      errorService.clearErrors();
      
      const stats = errorService.getErrorStats();
      expect(stats.total).toBe(0);
      expect(stats.recent).toHaveLength(0);
      expect(Object.keys(stats.byComponent)).toHaveLength(0);
    });

    it('should limit recent errors to maximum count', () => {
      // Add more than 10 errors (the limit)
      for (let i = 0; i < 15; i++) {
        const error = createMockError({ message: `Error ${i}` });
        errorService.handleError(error, { component: 'Component' });
      }
      
      const stats = errorService.getErrorStats();
      expect(stats.recent).toHaveLength(10);
      expect(stats.total).toBe(15);
    });
  });
});