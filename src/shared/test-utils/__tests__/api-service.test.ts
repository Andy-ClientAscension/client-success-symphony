import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiService } from '../../../shared/services/api-service';
import { createMockApiResponse, createMockApiError } from '../test-data-factories';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('request method', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
        status: 200,
        statusText: 'OK'
      });

      const response = await apiService.request('/test');
      
      expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      expect(response.data).toEqual(mockData);
    });

    it('should handle POST request with data', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, ...requestData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
        status: 201,
        statusText: 'Created'
      });

      const response = await apiService.request('/test', {
        method: 'POST',
        body: requestData
      });

      expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData)
      }));
      expect(response.data).toEqual(responseData);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid data' })
      });

      try {
        await apiService.request('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('HTTP 400');
      }
    });

    it('should retry on network failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          status: 200,
          statusText: 'OK'
        });

      const response = await apiService.request('/test', { retries: 2 });
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(response.data).toEqual({ success: true });
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      try {
        await apiService.request('/test', { timeout: 1000 });
        fail('Should have thrown timeout error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('convenience methods', () => {
    it('should make GET request via get method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        status: 200,
        statusText: 'OK'
      });

      await apiService.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
        method: 'GET'
      }));
    });

    it('should make POST request via post method', async () => {
      const data = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(data),
        status: 201,
        statusText: 'Created'
      });

      await apiService.post('/test', data);
      
      expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(data)
      }));
    });

    it('should make PUT request via put method', async () => {
      const data = { id: 1, name: 'updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(data),
        status: 200,
        statusText: 'OK'
      });

      await apiService.put('/test/1', data);
      
      expect(mockFetch).toHaveBeenCalledWith('/test/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(data)
      }));
    });

    it('should make DELETE request via delete method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        status: 200,
        statusText: 'OK'
      });

      await apiService.delete('/test/1');
      
      expect(mockFetch).toHaveBeenCalledWith('/test/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
});