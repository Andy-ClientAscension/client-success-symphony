
import { create } from 'zustand';
import { STORAGE_KEYS, saveData, loadData } from '@/utils/persistence';
import { format, addDays, subDays, subMonths } from 'date-fns';

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
  pauseDate?: string;
  pauseReason?: string;
  resumeDate?: string;
  csm?: string;
  notes?: Note[];
  paymentStatus?: PaymentStatus;
  npsScore?: number;
  mrr?: number;
  backendEnrolled?: boolean;
  olympiaEnrolled?: boolean;
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

// Generate fake student data
const generateFakeStudents = (count: number): Record<string, Student> => {
  const students: Record<string, Student> = {};
  const teams = ["Team-Andy", "Team-Chris", "Team-Cillin", "Team-Alex"];
  const names = [
    "Emma Wilson", "James Smith", "Olivia Johnson", "Noah Williams", "Sophia Brown", 
    "Liam Jones", "Ava Garcia", "Mason Miller", "Isabella Davis", "Logan Martinez",
    "Charlotte Rodriguez", "Elijah Hernandez", "Mia Lopez", "Alexander Gonzalez", "Harper Wilson",
    "Ethan Lee", "Amelia Walker", "Oliver Hall", "Abigail Allen", "Benjamin Young",
    "Emily King", "Daniel Wright", "Elizabeth Scott", "Matthew Torres", "Sofia Green",
    "Michael Adams", "Camila Baker", "Carter Flores", "Madison Nelson", "Jackson Hill",
    "Aria Mitchell", "Lucas Clark", "Penelope Rodriguez", "Sebastian Lewis", "Layla Lee",
    "Henry Harrison", "Chloe Martin", "Wyatt Thompson", "Ella White", "John Harris",
    "Grace Robinson", "Owen Lewis", "Victoria Walker", "Jack Allen", "Scarlett Hall",
    "William Scott", "Zoey Green", "Jayden King", "Luna Adams", "Gabriel Baker",
    "Mila Hall", "Dylan Mitchell", "Aubrey Martin", "Anthony Thompson", "Nora Harris"
  ];
  
  const today = new Date();
  
  for (let i = 1; i <= count; i++) {
    const id = `s${i + 9}`; // Start from s10 since we already have s1-s9
    const randomName = names[Math.floor(Math.random() * names.length)] || `Student ${id}`;
    const randomProgress = Math.floor(Math.random() * 101);
    
    // Ensure even distribution across teams
    const teamIndex = i % teams.length;
    const randomTeam = teams[teamIndex];
    
    const contractDuration = Math.random() > 0.5 ? "6months" : "1year";
    
    // Generate random dates
    const startOffset = Math.floor(Math.random() * 365);
    const startDate = subDays(today, startOffset);
    const endDate = contractDuration === "6months" 
      ? addDays(startDate, 180)
      : addDays(startDate, 365);
    
    // Random NPS score between 0-10
    const npsScore = Math.floor(Math.random() * 11);
    
    // Random MRR between 500-2000
    const mrr = Math.floor(Math.random() * 1500) + 500;
    
    // Generate notes for some students
    const hasNotes = Math.random() > 0.7;
    const notes = hasNotes ? [
      {
        id: `n${id}-1`,
        text: `${randomName} is making good progress with their current module.`,
        author: ["Sarah", "Michael", "David", "Emma", "Chris"][Math.floor(Math.random() * 5)],
        timestamp: format(subDays(today, Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm:ss')
      }
    ] : [];
    
    // Generate payment status
    const hasPaymentIssue = Math.random() > 0.8;
    const paymentStatus = hasPaymentIssue ? {
      isOverdue: true,
      daysOverdue: Math.floor(Math.random() * 60) + 1,
      amountDue: Math.floor(Math.random() * 1000) + 200,
      lastPaymentDate: format(subDays(today, 45 + Math.floor(Math.random() * 30)), 'yyyy-MM-dd')
    } : {
      isOverdue: false
    };
    
    // Add special cases for paused and churned students
    let churnDate;
    let pauseDate;
    let pauseReason;
    let resumeDate;
    
    if (i % 23 === 0) { // Some students are churned
      churnDate = format(subDays(today, Math.floor(Math.random() * 90) + 1), 'yyyy-MM-dd');
    }
    
    if (i % 17 === 0) { // Some students are paused
      pauseDate = format(subDays(today, Math.floor(Math.random() * 45) + 1), 'yyyy-MM-dd');
      pauseReason = ["Health issues", "Financial hardship", "Family emergency", "Travel", "Work commitments"][Math.floor(Math.random() * 5)];
      
      if (Math.random() > 0.5) { // Some paused students have resume dates
        resumeDate = format(addDays(today, Math.floor(Math.random() * 60) + 15), 'yyyy-MM-dd');
      }
    }
    
    // Backend or Olympia enrollments - distribute somewhat evenly
    const backendEnrolled = i % 5 === 0;
    const olympiaEnrolled = i % 7 === 0 && !backendEnrolled;
    
    students[id] = {
      id,
      name: randomName,
      progress: randomProgress,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      contractDuration,
      csm: randomTeam,
      notes,
      paymentStatus,
      churnDate,
      pauseDate,
      pauseReason,
      resumeDate,
      npsScore,
      mrr,
      backendEnrolled,
      olympiaEnrolled
    };
  }
  
  return students;
};

// Create initial data with existing and fake students
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
    'paused': {
      id: 'paused',
      title: 'Paused Students',
      studentIds: []
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
      ],
      mrr: 1200,
      npsScore: 9
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
      ],
      mrr: 1500,
      npsScore: 7
    },
    's3': { 
      id: 's3', 
      name: 'Carol Davis', 
      progress: 80,
      startDate: format(new Date(2023, 10, 5), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2024, 4, 5), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: [],
      mrr: 1200,
      npsScore: 8
    },
    's4': { 
      id: 's4', 
      name: 'Dave Wilson', 
      progress: 45,
      startDate: format(new Date(2023, 3, 12), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 9, 12), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: [],
      mrr: 1800,
      npsScore: 6,
      backendEnrolled: true
    },
    's5': { 
      id: 's5', 
      name: 'Eve Brown', 
      progress: 50,
      startDate: format(new Date(2023, 7, 20), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 7, 20), 'yyyy-MM-dd'),
      csm: "Team-Chris",
      notes: [],
      mrr: 1800,
      npsScore: 8,
      backendEnrolled: true
    },
    's6': { 
      id: 's6', 
      name: 'Frank Miller', 
      progress: 70,
      startDate: format(new Date(2023, 9, 3), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 9, 3), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: [],
      mrr: 2000,
      npsScore: 9,
      olympiaEnrolled: true
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
      notes: [],
      mrr: 0,
      npsScore: 3
    },
    's8': { 
      id: 's8', 
      name: 'Henry Taylor', 
      progress: 100,
      startDate: format(new Date(2023, 0, 15), 'yyyy-MM-dd'),
      contractDuration: "6months" as const,
      endDate: format(new Date(2023, 6, 15), 'yyyy-MM-dd'),
      csm: "Team-Cillin",
      notes: [],
      mrr: 0,
      npsScore: 10
    },
    's9': { 
      id: 's9', 
      name: 'Ivy Robinson', 
      progress: 100,
      startDate: format(new Date(2023, 1, 22), 'yyyy-MM-dd'),
      contractDuration: "1year" as const,
      endDate: format(new Date(2024, 1, 22), 'yyyy-MM-dd'),
      csm: "Team-Andy",
      notes: [],
      mrr: 0,
      npsScore: 9
    },
    // Add the remaining fake students
    ...generateFakeStudents(100)
  },
  columnOrder: ['active', 'backend', 'olympia', 'paused', 'churned', 'graduated']
};

// Distribute the fake students into the appropriate columns
(() => {
  // Reset all column studentIds except for s1-s9 which are already assigned
  INITIAL_DATA.columns.active.studentIds = ['s1', 's2', 's3'];
  INITIAL_DATA.columns.backend.studentIds = ['s4', 's5'];
  INITIAL_DATA.columns.olympia.studentIds = ['s6'];
  INITIAL_DATA.columns.churned.studentIds = ['s7'];
  INITIAL_DATA.columns.graduated.studentIds = ['s8', 's9'];
  INITIAL_DATA.columns.paused.studentIds = [];
  
  // Distribute students from s10 onwards
  for (let i = 10; i <= 109; i++) {
    const id = `s${i}`;
    const student = INITIAL_DATA.students[id];
    
    if (!student) continue;
    
    if (student.churnDate) {
      INITIAL_DATA.columns.churned.studentIds.push(id);
    } else if (student.pauseDate) {
      INITIAL_DATA.columns.paused.studentIds.push(id);
    } else if (student.progress === 100) {
      INITIAL_DATA.columns.graduated.studentIds.push(id);
    } else if (student.backendEnrolled) {
      INITIAL_DATA.columns.backend.studentIds.push(id);
    } else if (student.olympiaEnrolled) {
      INITIAL_DATA.columns.olympia.studentIds.push(id);
    } else {
      INITIAL_DATA.columns.active.studentIds.push(id);
    }
  }
})();

interface KanbanStore {
  data: KanbanState;
  filteredData: KanbanState;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  updateData: (newData: KanbanState) => void;
  moveStudent: (studentId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => void;
  addChurnDate: (studentId: string, date: Date) => void;
  addPauseDate: (studentId: string, date: Date, reason: string) => void;
  resumeFromPause: (studentId: string, date: Date) => void;
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
  
  addPauseDate: (studentId, date, reason) => {
    const { data } = get();
    const newData = { ...data };
    
    newData.students[studentId] = {
      ...newData.students[studentId],
      pauseDate: format(date, 'yyyy-MM-dd'),
      pauseReason: reason
    };
    
    get().updateData(newData);
  },
  
  resumeFromPause: (studentId, date) => {
    const { data } = get();
    const newData = { ...data };
    
    newData.students[studentId] = {
      ...newData.students[studentId],
      resumeDate: format(date, 'yyyy-MM-dd')
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
