
import { apiClient, apiRequest } from "./api-client";
import { supabase } from "@/integrations/supabase/client";
import { errorService } from "@/utils/error";
import type { ErrorState } from "@/utils/error/errorTypes";

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

interface StudentResponse {
  data: Student[] | null;
  count?: number;
  isLoading: boolean;
  error: ErrorState | null;
}

interface SingleStudentResponse {
  data: Student | null;
  isLoading: boolean;
  error: ErrorState | null;
}

/**
 * Get all students with optional filtering
 */
export async function getStudents(
  options?: GetStudentsOptions
): Promise<StudentResponse> {
  try {
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
      count,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      data: null,
      isLoading: false,
      error: errorService.createErrorState(error, "Failed to fetch students")
    };
  }
}

/**
 * Get a single student by ID
 */
export async function getStudent(id: string): Promise<SingleStudentResponse> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    return {
      data: data as Student,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error fetching student:", error);
    return {
      data: null,
      isLoading: false,
      error: errorService.createErrorState(error, "Failed to fetch student details")
    };
  }
}

/**
 * Update student notes
 */
export async function updateStudentNotes(
  id: string, 
  notes: string
): Promise<SingleStudentResponse> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({ notes })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return {
      data: data as Student,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error updating student notes:", error);
    return {
      data: null,
      isLoading: false,
      error: errorService.createErrorState(error, "Failed to update student notes")
    };
  }
}

/**
 * Create a new student
 */
export async function createStudent(
  student: Omit<Student, 'id'>
): Promise<SingleStudentResponse> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([student])
      .select()
      .maybeSingle();

    if (error) throw error;

    return {
      data: data as Student,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error creating student:", error);
    return {
      data: null,
      isLoading: false,
      error: errorService.createErrorState(error, "Failed to create student")
    };
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<{ success: boolean; error: ErrorState | null }> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error deleting student:", error);
    return {
      success: false,
      error: errorService.createErrorState(error, "Failed to delete student")
    };
  }
}
