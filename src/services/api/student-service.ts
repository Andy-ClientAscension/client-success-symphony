
import { apiCore, executeApiRequest, ApiResponse } from './api-core';
import { supabase } from "@/integrations/supabase/client";
import { errorService } from "@/utils/error";

export interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'completed';
  progress?: number;
  notes?: string;
  npsScore?: number;
  startDate?: string;
  endDate?: string;
  team?: string;
}

interface GetStudentsOptions {
  status?: string;
  team?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface StudentListResponse {
  data: Student[];
  count: number;
}

/**
 * Get all students with optional filtering
 */
export async function getStudents(
  options?: GetStudentsOptions
): Promise<ApiResponse<StudentListResponse>> {
  return executeApiRequest(async () => {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });

    // Apply filters if provided
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (options?.team) {
      query = query.eq('team', options.team);
    }
    
    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    
    // Apply pagination if provided
    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { 
      data: data as Student[],
      count: count || 0 
    };
  }, {
    errorMessage: "Failed to fetch students"
  });
}

/**
 * Get a single student by ID
 */
export async function getStudent(id: string): Promise<ApiResponse<Student>> {
  return executeApiRequest(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Student with ID ${id} not found`);

    return data as Student;
  }, {
    errorMessage: "Failed to fetch student details"
  });
}

/**
 * Update student notes
 */
export async function updateStudentNotes(
  id: string, 
  notes: string
): Promise<ApiResponse<Student>> {
  return executeApiRequest(async () => {
    const { data, error } = await supabase
      .from('clients')
      .update({ notes })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Failed to update student with ID ${id}`);

    return data as Student;
  }, {
    errorMessage: "Failed to update student notes"
  });
}

/**
 * Create a new student
 */
export async function createStudent(
  student: Omit<Student, 'id'>
): Promise<ApiResponse<Student>> {
  return executeApiRequest(async () => {
    const { data, error } = await supabase
      .from('clients')
      .insert([student])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create student');

    return data as Student;
  }, {
    errorMessage: "Failed to create student"
  });
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return executeApiRequest(async () => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  }, {
    errorMessage: "Failed to delete student"
  });
}
