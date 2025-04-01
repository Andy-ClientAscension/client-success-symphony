
import { create } from 'zustand';
import { INITIAL_DATA } from '@/components/Dashboard/KanbanBoard';
import { STORAGE_KEYS, saveData, loadData } from '@/utils/persistence';
import { format } from 'date-fns';

export interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  mentions?: string[];
}

export interface PaymentStatus {
  isOverdue: boolean;
  daysOverdue?: number;
  amountDue?: number;
}

export interface Student {
  id: string;
  name: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  contractDuration?: "6months" | "1year";
  churnDate?: string;
  csm?: string;
  notes?: Note[];
  paymentStatus?: PaymentStatus;
}

export interface KanbanColumn {
  id: string;
  title: string;
  studentIds: string[];
}

export interface KanbanState {
  columns: Record<string, KanbanColumn>;
  students: Record<string, Student>;
  columnOrder: string[];
}

interface KanbanStore {
  data: KanbanState;
  filteredData: KanbanState;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  updateData: (newData: KanbanState) => void;
  moveStudent: (studentId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => void;
  addChurnDate: (studentId: string, date: Date) => void;
  addNote: (studentId: string, note: Omit<Note, "id" | "timestamp">) => void;
  updateStudentTeam: (studentId: string, teamId: string) => void;
  reorderColumn: (columnId: string, startIndex: number, endIndex: number) => void;
  loadPersistedData: () => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  data: INITIAL_DATA,
  filteredData: INITIAL_DATA,
  selectedTeam: "all",

  setSelectedTeam: (team) => {
    set({ selectedTeam: team });
    const { data } = get();
    
    if (team === "all") {
      set({ filteredData: data });
      return;
    }
    
    const newData = { ...data };
    const filteredStudentIds = Object.keys(data.students).filter(
      id => data.students[id].csm === team
    );
    
    Object.keys(newData.columns).forEach(columnId => {
      newData.columns[columnId] = {
        ...data.columns[columnId],
        studentIds: data.columns[columnId].studentIds.filter(
          id => filteredStudentIds.includes(id)
        )
      };
    });
    
    set({ filteredData: newData });
  },

  updateData: (newData) => {
    set({ data: newData });
    const { selectedTeam } = get();
    
    // If a team filter is active, update the filtered data as well
    if (selectedTeam !== "all") {
      const filteredData = { ...newData };
      const filteredStudentIds = Object.keys(newData.students).filter(
        id => newData.students[id].csm === selectedTeam
      );
      
      Object.keys(filteredData.columns).forEach(columnId => {
        filteredData.columns[columnId] = {
          ...newData.columns[columnId],
          studentIds: newData.columns[columnId].studentIds.filter(
            id => filteredStudentIds.includes(id)
          )
        };
      });
      
      set({ filteredData });
    } else {
      set({ filteredData: newData });
    }
    
    // Persist data
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      saveData(STORAGE_KEYS.KANBAN, newData);
    }
  },
  
  moveStudent: (studentId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
    const { data } = get();
    const newData = { ...data };
    
    // Same column move
    if (sourceColumnId === destinationColumnId) {
      const column = { ...newData.columns[sourceColumnId] };
      const newStudentIds = Array.from(column.studentIds);
      newStudentIds.splice(sourceIndex, 1);
      newStudentIds.splice(destinationIndex, 0, studentId);
      
      column.studentIds = newStudentIds;
      newData.columns[sourceColumnId] = column;
    }
    // Different column move
    else {
      const sourceColumn = { ...newData.columns[sourceColumnId] };
      const destinationColumn = { ...newData.columns[destinationColumnId] };
      
      const sourceStudentIds = Array.from(sourceColumn.studentIds);
      const destStudentIds = Array.from(destinationColumn.studentIds);
      
      sourceStudentIds.splice(sourceIndex, 1);
      destStudentIds.splice(destinationIndex, 0, studentId);
      
      sourceColumn.studentIds = sourceStudentIds;
      destinationColumn.studentIds = destStudentIds;
      
      newData.columns[sourceColumnId] = sourceColumn;
      newData.columns[destinationColumnId] = destinationColumn;
    }
    
    set({ data: newData });
    get().updateData(newData);
  },
  
  addChurnDate: (studentId, date) => {
    const { data } = get();
    const newData = { ...data };
    
    newData.students[studentId] = {
      ...newData.students[studentId],
      churnDate: format(date, 'yyyy-MM-dd')
    };
    
    get().updateData(newData);
  },
  
  addNote: (studentId, note) => {
    const { data } = get();
    const newData = { ...data };
    
    const newNote = {
      id: `n${Date.now()}`,
      ...note,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    newData.students[studentId] = {
      ...newData.students[studentId],
      notes: [...(newData.students[studentId].notes || []), newNote]
    };
    
    get().updateData(newData);
  },
  
  updateStudentTeam: (studentId, teamId) => {
    const { data } = get();
    const newData = { ...data };
    
    newData.students[studentId] = {
      ...newData.students[studentId],
      csm: teamId
    };
    
    get().updateData(newData);
  },
  
  reorderColumn: (columnId, startIndex, endIndex) => {
    const { data } = get();
    const newData = { ...data };
    const column = { ...newData.columns[columnId] };
    const newStudentIds = Array.from(column.studentIds);
    
    const [removed] = newStudentIds.splice(startIndex, 1);
    newStudentIds.splice(endIndex, 0, removed);
    
    column.studentIds = newStudentIds;
    newData.columns[columnId] = column;
    
    get().updateData(newData);
  },
  
  loadPersistedData: () => {
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      const savedData = loadData(STORAGE_KEYS.KANBAN, INITIAL_DATA);
      set({ data: savedData, filteredData: savedData });
    }
  }
}));
