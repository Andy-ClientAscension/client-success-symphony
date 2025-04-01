import { create } from 'zustand';
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
  clientId?: string;
  clientName?: string;
  lastPaymentDate?: string | null;
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

export const INITIAL_DATA: KanbanState = {
  columns: {
    'active': {
      id: 'active',
      title: 'Active Students',
      studentIds: ['s1', 's2', 's3']
    },
    'backend': {
      id: 'backend',
      title: 'Backend Students',
      studentIds: ['s4', 's5']
    },
    'olympia': {
      id: 'olympia',
      title: 'Olympia Students',
      studentIds: ['s6']
    },
    'churned': {
      id: 'churned',
      title: 'Churned Students',
      studentIds: ['s7']
    },
    'graduated': {
      id: 'graduated',
      title: 'Graduated Students',
      studentIds: ['s8', 's9']
    }
  },
  students: {
    's1': { 
      id: 's1', 
      name: 'Alice Johnson', 
      progress: 75, 
      startDate: format(new Date(2023, 5, 15), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 11, 15), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: [
        {
          id: 'n1',
          text: 'Alice is making great progress with the frontend module.',
          author: 'Sarah',
          timestamp: format(new Date(2023, 6, 10), 'yyyy-MM-dd HH:mm:ss')
        }
      ]
    },
    's2': { 
      id: 's2', 
      name: 'Bob Smith', 
      progress: 60,
      startDate: format(new Date(2023, 8, 10), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 8, 10), 'yyyy-MM-dd'),
      csm: "Team-Chris",
      notes: [
        {
          id: 'n2',
          text: 'Bob might need help with React hooks. @michael please check in with him.',
          author: 'David',
          timestamp: format(new Date(2023, 9, 5), 'yyyy-MM-dd HH:mm:ss'),
          mentions: ['michael']
        }
      ]
    },
    's3': { 
      id: 's3', 
      name: 'Carol Davis', 
      progress: 80,
      startDate: format(new Date(2023, 10, 5), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2024, 4, 5), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    },
    's4': { 
      id: 's4', 
      name: 'Dave Wilson', 
      progress: 45,
      startDate: format(new Date(2023, 3, 12), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 9, 12), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's5': { 
      id: 's5', 
      name: 'Eve Brown', 
      progress: 50,
      startDate: format(new Date(2023, 7, 20), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 7, 20), 'yyyy-MM-dd'),
      csm: "Team-Chris",
      notes: []
    },
    's6': { 
      id: 's6', 
      name: 'Frank Miller', 
      progress: 70,
      startDate: format(new Date(2023, 9, 3), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 9, 3), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's7': { 
      id: 's7', 
      name: 'Grace Lee', 
      progress: 30,
      startDate: format(new Date(2023, 2, 8), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 8, 8), 'yyyy-MM-dd'),
      churnDate: format(new Date(2023, 4, 15), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    },
    's8': { 
      id: 's8', 
      name: 'Henry Taylor', 
      progress: 100,
      startDate: format(new Date(2023, 0, 15), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 6, 15), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: []
    },
    's9': { 
      id: 's9', 
      name: 'Ivy Robinson', 
      progress: 100,
      startDate: format(new Date(2023, 1, 22), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 1, 22), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: []
    }
  },
  columnOrder: ['active', 'backend', 'olympia', 'churned', 'graduated']
};

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
    
    const persistEnabled = localStorage.getItem("persistDashboard") === "true";
    if (persistEnabled) {
      saveData(STORAGE_KEYS.KANBAN, newData);
    }
  },
  
  moveStudent: (studentId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
    const { data } = get();
    const newData = { ...data };
    
    if (sourceColumnId === destinationColumnId) {
      const column = { ...newData.columns[sourceColumnId] };
      const newStudentIds = Array.from(column.studentIds);
      newStudentIds.splice(sourceIndex, 1);
      newStudentIds.splice(destinationIndex, 0, studentId);
      
      column.studentIds = newStudentIds;
      newData.columns[sourceColumnId] = column;
    }
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
