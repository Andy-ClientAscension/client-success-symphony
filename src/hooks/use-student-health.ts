
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { STORAGE_KEYS, loadData } from '@/utils/persistence';
import { 
  getStudentHealthData, 
  updateHealthFromNotes, 
  calculateHealthScore,
  getRiskCategory,
  saveHealthScoreData
} from '@/utils/healthScoreUtils';

interface UseStudentHealthOptions {
  autoUpdateFromNotes?: boolean;
}

export function useStudentHealth(studentId: string, options: UseStudentHealthOptions = {}) {
  const [healthData, setHealthData] = useState<StudentHealth.StudentHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { autoUpdateFromNotes = true } = options;

  // Load health data for the student
  const loadHealthData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get student health data
      let data = getStudentHealthData(studentId);
      
      // If enabled, update health from bi-weekly notes
      if (autoUpdateFromNotes) {
        // Load bi-weekly notes
        const notes = loadData<any[]>(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${studentId}`, []);
        
        // Update health data based on notes
        if (notes && notes.length > 0) {
          data = updateHealthFromNotes(studentId, notes);
        }
      }
      
      setHealthData(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load health data');
      setError(error);
      toast({
        title: "Error loading health data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [studentId, autoUpdateFromNotes, toast]);

  // Update health score factors manually
  const updateHealthFactors = useCallback((
    factors: Partial<StudentHealth.HealthScoreFactors>
  ) => {
    if (!healthData) return;
    
    try {
      // Merge new factors with existing ones
      const updatedFactors = {
        ...healthData.factors,
        ...factors
      };
      
      // Calculate new score
      const newScore = calculateHealthScore(updatedFactors);
      const riskCategory = getRiskCategory(newScore);
      
      // Create new history entry
      const newHistoryEntry: StudentHealth.HealthScoreHistory = {
        date: new Date().toISOString(),
        score: newScore,
        factors: updatedFactors
      };
      
      // Update health data
      const updatedData: StudentHealth.StudentHealthData = {
        ...healthData,
        currentScore: newScore,
        riskLevel: riskCategory.level,
        lastUpdated: new Date().toISOString(),
        factors: updatedFactors,
        history: [newHistoryEntry, ...healthData.history].slice(0, 100), // Keep last 100 entries
      };
      
      // Save and update state
      saveHealthScoreData(updatedData);
      setHealthData(updatedData);
      
      toast({
        title: "Health score updated",
        description: `New score: ${newScore}`,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update health factors');
      setError(error);
      toast({
        title: "Error updating health score",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [healthData, toast]);

  // Add a new note and update health score
  const addHealthNote = useCallback((note: any) => {
    if (!healthData) return;
    
    try {
      // Get existing notes
      const notes = loadData<any[]>(`${STORAGE_KEYS.CLIENT_NOTES}_biweekly_${studentId}`, []);
      
      // Add new note to the beginning
      const updatedNotes = [note, ...(notes || [])];
      
      // Update health from notes
      const updatedData = updateHealthFromNotes(studentId, updatedNotes);
      
      // Update state
      setHealthData(updatedData);
      
      toast({
        title: "Health score updated from notes",
        description: `New score: ${updatedData.currentScore}`,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update health from notes');
      setError(error);
      toast({
        title: "Error updating health from notes",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [healthData, studentId, toast]);

  // Initial load
  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  return {
    healthData,
    isLoading,
    error,
    loadHealthData,
    updateHealthFactors,
    addHealthNote
  };
}
