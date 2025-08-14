import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  getStudents, 
  getStudent, 
  updateStudentNotes, 
  createStudent, 
  deleteStudent 
} from '../student-service';
import { createMockClients, createMockApiResponse, createMockApiError } from '../../../shared/test-utils/test-data-factories';

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
    // Reset the chain
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.range.mockReturnValue(mockSupabase);
  });

  describe('getStudents', () => {
    it('should fetch all students successfully', async () => {
      const mockStudents = createMockClients(5);
      mockSupabase.then.mockResolvedValue({
        data: mockStudents,
        error: null,
        count: 5
      });

      const result = await getStudents();

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockStudents);
      expect(result.data?.count).toBe(5);
    });

    it('should apply status filter when provided', async () => {
      const mockStudents = createMockClients(3);
      mockSupabase.then.mockResolvedValue({
        data: mockStudents,
        error: null,
        count: 3
      });

      await getStudents({ status: 'active' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should apply team filter when provided', async () => {
      const mockStudents = createMockClients(3);
      mockSupabase.then.mockResolvedValue({
        data: mockStudents,
        error: null,
        count: 3
      });

      await getStudents({ team: 'Team-A' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('team', 'Team-A');
    });

    it('should apply search filter when provided', async () => {
      const mockStudents = createMockClients(2);
      mockSupabase.then.mockResolvedValue({
        data: mockStudents,
        error: null,
        count: 2
      });

      await getStudents({ search: 'john' });

      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%john%');
    });

    it('should apply pagination when provided', async () => {
      const mockStudents = createMockClients(10);
      mockSupabase.then.mockResolvedValue({
        data: mockStudents.slice(0, 5),
        error: null,
        count: 10
      });

      await getStudents({ page: 1, limit: 5 });

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 4);
    });

    it('should handle errors from Supabase', async () => {
      const mockError = new Error('Database error');
      mockSupabase.then.mockResolvedValue({
        data: null,
        error: mockError,
        count: null
      });

      const result = await getStudents();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getStudent', () => {
    it('should fetch single student successfully', async () => {
      const mockStudent = createMockClients(1)[0];
      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockStudent,
        error: null
      });

      const result = await getStudent(mockStudent.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockStudent.id);
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStudent);
    });

    it('should handle student not found', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await getStudent('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error?.includes('not found')).toBe(true);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await getStudent('student-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateStudentNotes', () => {
    it('should update student notes successfully', async () => {
      const mockStudent = createMockClients(1)[0];
      const updatedNotes = 'Updated notes';
      
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { ...mockStudent, notes: updatedNotes },
        error: null
      });

      const result = await updateStudentNotes(mockStudent.id, updatedNotes);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.update).toHaveBeenCalledWith({ notes: updatedNotes });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockStudent.id);
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.notes).toBe(updatedNotes);
    });

    it('should handle update failure', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await updateStudentNotes('student-id', 'notes');

      expect(result.success).toBe(false);
      expect(result.error?.includes('Failed to update')).toBe(true);
    });
  });

  describe('createStudent', () => {
    it('should create student successfully', async () => {
      const newStudent = {
        name: 'New Student',
        email: 'new@example.com',
        status: 'active' as const
      };
      
      const createdStudent = { id: 'new-id', ...newStudent };
      
      mockSupabase.maybeSingle.mockResolvedValue({
        data: createdStudent,
        error: null
      });

      const result = await createStudent(newStudent);

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.insert).toHaveBeenCalledWith([newStudent]);
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdStudent);
    });

    it('should handle creation failure', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await createStudent({
        name: 'Test',
        email: 'test@example.com',
        status: 'active'
      });

      expect(result.success).toBe(false);
      expect(result.error?.includes('Failed to create')).toBe(true);
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null
      });

      const result = await deleteStudent('student-id');

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'student-id');
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should handle deletion failure', async () => {
      const mockError = new Error('Delete failed');
      mockSupabase.delete.mockResolvedValue({
        error: mockError
      });

      const result = await deleteStudent('student-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});