import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  getStudents, 
  getStudent, 
  updateStudentNotes, 
  createStudent, 
  deleteStudent 
} from '../student-service';

// Mock the executeApiRequest function
const mockExecuteApiRequest = vi.fn();
vi.mock('./api-core', () => ({
  executeApiRequest: mockExecuteApiRequest,
  ApiResponse: {}
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  then: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/utils/error', () => ({
  errorService: {
    handleError: vi.fn()
  }
}));

describe('Student Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Make executeApiRequest pass through by default
    mockExecuteApiRequest.mockImplementation((fn) => fn());
  });

  describe('getStudents', () => {
    it('should fetch all students successfully', async () => {
      const mockData = [
        { id: '1', name: 'Student 1', email: 'student1@test.com', status: 'active' },
        { id: '2', name: 'Student 2', email: 'student2@test.com', status: 'inactive' }
      ];
      
      mockSupabase.then.mockResolvedValue({
        data: mockData,
        error: null,
        count: 2
      });

      const result = await getStudents();

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(result).toEqual({ data: mockData, count: 2 });
    });

    it('should apply filters correctly', async () => {
      mockSupabase.then.mockResolvedValue({
        data: [],
        error: null,
        count: 0
      });

      await getStudents({ status: 'active', team: 'Team-A', search: 'john' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabase.eq).toHaveBeenCalledWith('team', 'Team-A');
      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%john%');
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      mockSupabase.then.mockRejectedValue(mockError);

      try {
        await getStudents();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('getStudent', () => {
    it('should fetch single student', async () => {
      const mockStudent = { id: '1', name: 'Test Student', email: 'test@test.com', status: 'active' };
      
      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockStudent,
        error: null
      });

      const result = await getStudent('1');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(mockStudent);
    });

    it('should handle not found', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      try {
        await getStudent('missing');
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }
    });
  });

  describe('updateStudentNotes', () => {
    it('should update notes successfully', async () => {
      const updatedStudent = { id: '1', name: 'Test', notes: 'New notes' };
      
      mockSupabase.maybeSingle.mockResolvedValue({
        data: updatedStudent,
        error: null
      });

      const result = await updateStudentNotes('1', 'New notes');

      expect(mockSupabase.update).toHaveBeenCalledWith({ notes: 'New notes' });
      expect(result).toBe(updatedStudent);
    });
  });

  describe('createStudent', () => {
    it('should create student successfully', async () => {
      const newStudent = { name: 'New Student', email: 'new@test.com', status: 'active' as const };
      const createdStudent = { id: '1', ...newStudent };
      
      mockSupabase.maybeSingle.mockResolvedValue({
        data: createdStudent,
        error: null
      });

      const result = await createStudent(newStudent);

      expect(mockSupabase.insert).toHaveBeenCalledWith([newStudent]);
      expect(result).toBe(createdStudent);
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null
      });

      const result = await deleteStudent('1');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual({ success: true });
    });
  });
});