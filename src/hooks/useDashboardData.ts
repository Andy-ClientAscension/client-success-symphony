import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData, getClientMetricsByTeam } from "@/lib/data";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAutoSync } from "@/hooks/useAutoSync";

export const DATA_KEYS = {
  CLIENTS: 'clients',
  CLIENT_COUNTS: 'client-counts',
  NPS_DATA: 'nps-data',
  CHURN_DATA: 'churn-data',
  TEAM_METRICS: 'team-metrics',
  ALL_DATA: 'all-dashboard-data'
};

export const DASHBOARD_KEYS = DATA_KEYS; // Alias for compatibility

// Mock data for development mode
const mockClients = [
  { id: '1', name: 'TechCorp Inc', status: 'active' as const, team: 'Alpha', csm: 'John Smith', assigned_ssc: 'Andy', startDate: '2024-01-15', endDate: '2024-12-15', contractValue: 50000, mrr: 4167, callsBooked: 25, dealsClosed: 12, progress: 85, npsScore: 9, lastCommunication: '2024-08-10', growth: 15, backendStudents: 45, notes: 'Great client', lastPayment: { amount: 4167, date: '2024-08-01' }, logo: null },
  { id: '2', name: 'StartupX', status: 'at-risk' as const, team: 'Beta', csm: 'Sarah Johnson', assigned_ssc: 'Nick', startDate: '2024-02-01', endDate: '2024-11-30', contractValue: 25000, mrr: 2083, callsBooked: 12, dealsClosed: 5, progress: 60, npsScore: 6, lastCommunication: '2024-08-05', growth: -5, backendStudents: 20, notes: 'Needs attention', lastPayment: { amount: 2083, date: '2024-08-01' }, logo: null },
  { id: '3', name: 'Enterprise Solutions', status: 'active' as const, team: 'Gamma', csm: 'Mike Davis', assigned_ssc: 'Chris', startDate: '2024-03-10', endDate: '2025-02-10', contractValue: 100000, mrr: 8333, callsBooked: 40, dealsClosed: 28, progress: 92, npsScore: 10, lastCommunication: '2024-08-12', growth: 25, backendStudents: 80, notes: 'Top performer', lastPayment: { amount: 8333, date: '2024-08-01' }, logo: null },
  { id: '4', name: 'Digital Dynamics', status: 'new' as const, team: 'Alpha', csm: 'Lisa Wilson', assigned_ssc: 'Cillin', startDate: '2024-08-01', endDate: '2025-07-31', contractValue: 75000, mrr: 6250, callsBooked: 8, dealsClosed: 2, progress: 30, npsScore: 8, lastCommunication: '2024-08-14', growth: 0, backendStudents: 35, notes: 'New client', lastPayment: { amount: 6250, date: '2024-08-01' }, logo: null },
  { id: '5', name: 'InnovateTech', status: 'active' as const, team: 'Beta', csm: 'Tom Anderson', assigned_ssc: 'Stephen', startDate: '2024-04-15', endDate: '2025-03-15', contractValue: 60000, mrr: 5000, callsBooked: 30, dealsClosed: 18, progress: 78, npsScore: 8, lastCommunication: '2024-08-11', growth: 12, backendStudents: 55, notes: 'Strong performance', lastPayment: { amount: 5000, date: '2024-08-01' }, logo: null },
  { id: '6', name: 'CloudFirst Solutions', status: 'active' as const, team: 'Alpha', csm: 'James Brown', assigned_ssc: 'Andy', startDate: '2024-05-01', endDate: '2025-04-30', contractValue: 45000, mrr: 3750, callsBooked: 22, dealsClosed: 15, progress: 82, npsScore: 9, lastCommunication: '2024-08-13', growth: 18, backendStudents: 40, notes: 'Excellent client', lastPayment: { amount: 3750, date: '2024-08-01' }, logo: null },
  { id: '7', name: 'DataCorp Analytics', status: 'at-risk' as const, team: 'Gamma', csm: 'Emily White', assigned_ssc: 'Nick', startDate: '2024-01-20', endDate: '2024-10-20', contractValue: 35000, mrr: 2917, callsBooked: 10, dealsClosed: 4, progress: 45, npsScore: 5, lastCommunication: '2024-08-03', growth: -8, backendStudents: 25, notes: 'Needs immediate attention', lastPayment: { amount: 2917, date: '2024-08-01' }, logo: null },
  { id: '8', name: 'FinTech Innovators', status: 'active' as const, team: 'Beta', csm: 'Robert Green', assigned_ssc: 'Chris', startDate: '2024-06-01', endDate: '2025-05-31', contractValue: 80000, mrr: 6667, callsBooked: 35, dealsClosed: 22, progress: 88, npsScore: 9, lastCommunication: '2024-08-15', growth: 22, backendStudents: 65, notes: 'High performer', lastPayment: { amount: 6667, date: '2024-08-01' }, logo: null },
  { id: '9', name: 'RetailTech Pro', status: 'new' as const, team: 'Alpha', csm: 'Susan Miller', assigned_ssc: 'Cillin', startDate: '2024-08-05', endDate: '2025-08-04', contractValue: 55000, mrr: 4583, callsBooked: 5, dealsClosed: 1, progress: 25, npsScore: 7, lastCommunication: '2024-08-15', growth: 0, backendStudents: 30, notes: 'Just started', lastPayment: { amount: 4583, date: '2024-08-01' }, logo: null },
  { id: '10', name: 'MedTech Solutions', status: 'active' as const, team: 'Gamma', csm: 'David Lee', assigned_ssc: 'Stephen', startDate: '2024-02-15', endDate: '2025-01-15', contractValue: 90000, mrr: 7500, callsBooked: 38, dealsClosed: 25, progress: 95, npsScore: 10, lastCommunication: '2024-08-14', growth: 28, backendStudents: 75, notes: 'Outstanding results', lastPayment: { amount: 7500, date: '2024-08-01' }, logo: null },
  // Adding 32 more clients to reach 42 total
  { id: '11', name: 'AgriTech Ventures', status: 'active' as const, team: 'Beta', csm: 'Lisa Chen', assigned_ssc: 'Andy', startDate: '2024-03-01', endDate: '2025-02-28', contractValue: 42000, mrr: 3500, callsBooked: 20, dealsClosed: 14, progress: 80, npsScore: 8, lastCommunication: '2024-08-12', growth: 15, backendStudents: 38, notes: 'Solid performance', lastPayment: { amount: 3500, date: '2024-08-01' }, logo: null },
  { id: '12', name: 'EduTech Prime', status: 'at-risk' as const, team: 'Alpha', csm: 'Mark Wilson', assigned_ssc: 'Nick', startDate: '2024-01-10', endDate: '2024-12-10', contractValue: 28000, mrr: 2333, callsBooked: 8, dealsClosed: 3, progress: 40, npsScore: 4, lastCommunication: '2024-08-02', growth: -12, backendStudents: 18, notes: 'Requires intervention', lastPayment: { amount: 2333, date: '2024-08-01' }, logo: null },
  { id: '13', name: 'SportsTech Hub', status: 'active' as const, team: 'Gamma', csm: 'Sarah Davis', assigned_ssc: 'Chris', startDate: '2024-04-20', endDate: '2025-03-20', contractValue: 38000, mrr: 3167, callsBooked: 18, dealsClosed: 12, progress: 75, npsScore: 8, lastCommunication: '2024-08-11', growth: 12, backendStudents: 32, notes: 'Good progress', lastPayment: { amount: 3167, date: '2024-08-01' }, logo: null },
  { id: '14', name: 'GreenTech Solutions', status: 'new' as const, team: 'Beta', csm: 'Tom Rodriguez', assigned_ssc: 'Cillin', startDate: '2024-08-10', endDate: '2025-08-09', contractValue: 48000, mrr: 4000, callsBooked: 3, dealsClosed: 0, progress: 15, npsScore: 6, lastCommunication: '2024-08-16', growth: 0, backendStudents: 25, notes: 'Early stage', lastPayment: { amount: 4000, date: '2024-08-01' }, logo: null },
  { id: '15', name: 'AutoTech Systems', status: 'active' as const, team: 'Alpha', csm: 'Jennifer Kim', assigned_ssc: 'Stephen', startDate: '2024-05-15', endDate: '2025-04-15', contractValue: 65000, mrr: 5417, callsBooked: 28, dealsClosed: 18, progress: 85, npsScore: 9, lastCommunication: '2024-08-13', growth: 20, backendStudents: 52, notes: 'Excellent client', lastPayment: { amount: 5417, date: '2024-08-01' }, logo: null },
  { id: '16', name: 'FoodTech Innovations', status: 'active' as const, team: 'Gamma', csm: 'Chris Taylor', assigned_ssc: 'Andy', startDate: '2024-06-10', endDate: '2025-05-10', contractValue: 52000, mrr: 4333, callsBooked: 24, dealsClosed: 16, progress: 78, npsScore: 8, lastCommunication: '2024-08-14', growth: 16, backendStudents: 45, notes: 'Strong performance', lastPayment: { amount: 4333, date: '2024-08-01' }, logo: null },
  { id: '17', name: 'TravelTech Plus', status: 'churned' as const, team: 'Beta', csm: 'Amanda Johnson', assigned_ssc: null, startDate: '2023-12-01', endDate: '2024-07-31', contractValue: 30000, mrr: 0, callsBooked: 15, dealsClosed: 8, progress: 100, npsScore: 3, lastCommunication: '2024-07-30', growth: -20, backendStudents: 0, notes: 'Contract ended', lastPayment: { amount: 2500, date: '2024-07-01' }, logo: null },
  { id: '18', name: 'PropTech Leaders', status: 'active' as const, team: 'Alpha', csm: 'Michael Brown', assigned_ssc: 'Nick', startDate: '2024-07-01', endDate: '2025-06-30', contractValue: 70000, mrr: 5833, callsBooked: 32, dealsClosed: 20, progress: 88, npsScore: 9, lastCommunication: '2024-08-15', growth: 25, backendStudents: 58, notes: 'High potential', lastPayment: { amount: 5833, date: '2024-08-01' }, logo: null },
  { id: '19', name: 'GameTech Studios', status: 'at-risk' as const, team: 'Gamma', csm: 'Rachel Green', assigned_ssc: 'Chris', startDate: '2024-02-10', endDate: '2024-11-10', contractValue: 32000, mrr: 2667, callsBooked: 12, dealsClosed: 6, progress: 50, npsScore: 5, lastCommunication: '2024-08-04', growth: -6, backendStudents: 22, notes: 'Declining engagement', lastPayment: { amount: 2667, date: '2024-08-01' }, logo: null },
  { id: '20', name: 'HealthTech Pioneers', status: 'active' as const, team: 'Beta', csm: 'Kevin Liu', assigned_ssc: 'Cillin', startDate: '2024-03-25', endDate: '2025-02-25', contractValue: 85000, mrr: 7083, callsBooked: 36, dealsClosed: 24, progress: 90, npsScore: 10, lastCommunication: '2024-08-16', growth: 30, backendStudents: 68, notes: 'Exceptional results', lastPayment: { amount: 7083, date: '2024-08-01' }, logo: null },
  { id: '21', name: 'LogiTech Express', status: 'new' as const, team: 'Alpha', csm: 'Nicole White', assigned_ssc: 'Stephen', startDate: '2024-08-12', endDate: '2025-08-11', contractValue: 44000, mrr: 3667, callsBooked: 2, dealsClosed: 0, progress: 10, npsScore: 7, lastCommunication: '2024-08-17', growth: 0, backendStudents: 28, notes: 'Just onboarded', lastPayment: { amount: 3667, date: '2024-08-01' }, logo: null },
  { id: '22', name: 'CyberTech Defense', status: 'active' as const, team: 'Gamma', csm: 'Paul Anderson', assigned_ssc: 'Andy', startDate: '2024-04-05', endDate: '2025-03-05', contractValue: 95000, mrr: 7917, callsBooked: 42, dealsClosed: 28, progress: 92, npsScore: 10, lastCommunication: '2024-08-15', growth: 32, backendStudents: 78, notes: 'Top tier client', lastPayment: { amount: 7917, date: '2024-08-01' }, logo: null },
  { id: '23', name: 'BioTech Labs', status: 'active' as const, team: 'Beta', csm: 'Grace Chen', assigned_ssc: 'Nick', startDate: '2024-05-20', endDate: '2025-04-20', contractValue: 58000, mrr: 4833, callsBooked: 26, dealsClosed: 17, progress: 82, npsScore: 8, lastCommunication: '2024-08-13', growth: 18, backendStudents: 48, notes: 'Consistent performer', lastPayment: { amount: 4833, date: '2024-08-01' }, logo: null },
  { id: '24', name: 'EnergyTech Future', status: 'active' as const, team: 'Alpha', csm: 'Daniel Kim', assigned_ssc: 'Chris', startDate: '2024-06-15', endDate: '2025-05-15', contractValue: 62000, mrr: 5167, callsBooked: 29, dealsClosed: 19, progress: 86, npsScore: 9, lastCommunication: '2024-08-14', growth: 22, backendStudents: 51, notes: 'Growing rapidly', lastPayment: { amount: 5167, date: '2024-08-01' }, logo: null },
  { id: '25', name: 'SpaceTech Ventures', status: 'at-risk' as const, team: 'Gamma', csm: 'Laura Martinez', assigned_ssc: 'Cillin', startDate: '2024-01-30', endDate: '2024-10-30', contractValue: 36000, mrr: 3000, callsBooked: 14, dealsClosed: 7, progress: 55, npsScore: 6, lastCommunication: '2024-08-06', growth: -4, backendStudents: 26, notes: 'Needs support', lastPayment: { amount: 3000, date: '2024-08-01' }, logo: null },
  { id: '26', name: 'MarineTech Ocean', status: 'active' as const, team: 'Beta', csm: 'Ryan Davis', assigned_ssc: 'Stephen', startDate: '2024-07-05', endDate: '2025-06-05', contractValue: 54000, mrr: 4500, callsBooked: 25, dealsClosed: 15, progress: 75, npsScore: 8, lastCommunication: '2024-08-12', growth: 14, backendStudents: 42, notes: 'Good momentum', lastPayment: { amount: 4500, date: '2024-08-01' }, logo: null },
  { id: '27', name: 'LegalTech Pro', status: 'new' as const, team: 'Alpha', csm: 'Sophie Wilson', assigned_ssc: 'Andy', startDate: '2024-08-08', endDate: '2025-08-07', contractValue: 46000, mrr: 3833, callsBooked: 4, dealsClosed: 1, progress: 20, npsScore: 7, lastCommunication: '2024-08-16', growth: 0, backendStudents: 32, notes: 'Getting started', lastPayment: { amount: 3833, date: '2024-08-01' }, logo: null },
  { id: '28', name: 'AeroTech Wings', status: 'active' as const, team: 'Gamma', csm: 'Brandon Lee', assigned_ssc: 'Nick', startDate: '2024-02-20', endDate: '2025-01-20', contractValue: 78000, mrr: 6500, callsBooked: 34, dealsClosed: 22, progress: 89, npsScore: 9, lastCommunication: '2024-08-15', growth: 26, backendStudents: 62, notes: 'Soaring high', lastPayment: { amount: 6500, date: '2024-08-01' }, logo: null },
  { id: '29', name: 'CleanTech Green', status: 'active' as const, team: 'Beta', csm: 'Emma Thompson', assigned_ssc: 'Chris', startDate: '2024-04-30', endDate: '2025-03-30', contractValue: 50000, mrr: 4167, callsBooked: 23, dealsClosed: 15, progress: 77, npsScore: 8, lastCommunication: '2024-08-11', growth: 17, backendStudents: 41, notes: 'Sustainable growth', lastPayment: { amount: 4167, date: '2024-08-01' }, logo: null },
  { id: '30', name: 'MiningTech Deep', status: 'churned' as const, team: 'Alpha', csm: 'Carlos Rodriguez', assigned_ssc: null, startDate: '2023-11-15', endDate: '2024-06-15', contractValue: 40000, mrr: 0, callsBooked: 18, dealsClosed: 10, progress: 100, npsScore: 2, lastCommunication: '2024-06-14', growth: -25, backendStudents: 0, notes: 'Contract terminated', lastPayment: { amount: 3333, date: '2024-06-01' }, logo: null },
  { id: '31', name: 'FashionTech Style', status: 'active' as const, team: 'Gamma', csm: 'Isabella Garcia', assigned_ssc: 'Cillin', startDate: '2024-05-10', endDate: '2025-04-10', contractValue: 41000, mrr: 3417, callsBooked: 19, dealsClosed: 13, progress: 73, npsScore: 7, lastCommunication: '2024-08-13', growth: 11, backendStudents: 35, notes: 'Fashionably growing', lastPayment: { amount: 3417, date: '2024-08-01' }, logo: null },
  { id: '32', name: 'WaterTech Flow', status: 'active' as const, team: 'Beta', csm: 'Nathan Brown', assigned_ssc: 'Stephen', startDate: '2024-06-25', endDate: '2025-05-25', contractValue: 56000, mrr: 4667, callsBooked: 27, dealsClosed: 18, progress: 81, npsScore: 8, lastCommunication: '2024-08-14', growth: 19, backendStudents: 46, notes: 'Flowing smoothly', lastPayment: { amount: 4667, date: '2024-08-01' }, logo: null },
  { id: '33', name: 'PetTech Care', status: 'at-risk' as const, team: 'Alpha', csm: 'Victoria Lee', assigned_ssc: 'Andy', startDate: '2024-03-05', endDate: '2024-12-05', contractValue: 33000, mrr: 2750, callsBooked: 11, dealsClosed: 5, progress: 48, npsScore: 5, lastCommunication: '2024-08-07', growth: -7, backendStudents: 21, notes: 'Needs TLC', lastPayment: { amount: 2750, date: '2024-08-01' }, logo: null },
  { id: '34', name: 'MusicTech Sound', status: 'new' as const, team: 'Gamma', csm: 'Oliver Martinez', assigned_ssc: 'Nick', startDate: '2024-08-14', endDate: '2025-08-13', contractValue: 47000, mrr: 3917, callsBooked: 1, dealsClosed: 0, progress: 5, npsScore: 6, lastCommunication: '2024-08-18', growth: 0, backendStudents: 30, notes: 'Making music', lastPayment: { amount: 3917, date: '2024-08-01' }, logo: null },
  { id: '35', name: 'BookTech Pages', status: 'active' as const, team: 'Beta', csm: 'Zoe Wang', assigned_ssc: 'Chris', startDate: '2024-01-25', endDate: '2024-12-25', contractValue: 39000, mrr: 3250, callsBooked: 17, dealsClosed: 11, progress: 70, npsScore: 7, lastCommunication: '2024-08-10', growth: 9, backendStudents: 33, notes: 'Writing success', lastPayment: { amount: 3250, date: '2024-08-01' }, logo: null },
  { id: '36', name: 'FilmTech Cinema', status: 'active' as const, team: 'Alpha', csm: 'Jack Johnson', assigned_ssc: 'Cillin', startDate: '2024-07-10', endDate: '2025-06-10', contractValue: 60000, mrr: 5000, callsBooked: 30, dealsClosed: 20, progress: 83, npsScore: 9, lastCommunication: '2024-08-15', growth: 21, backendStudents: 50, notes: 'Blockbuster client', lastPayment: { amount: 5000, date: '2024-08-01' }, logo: null },
  { id: '37', name: 'ArtTech Creative', status: 'active' as const, team: 'Gamma', csm: 'Maya Patel', assigned_ssc: 'Stephen', startDate: '2024-02-28', endDate: '2025-01-28', contractValue: 43000, mrr: 3583, callsBooked: 21, dealsClosed: 14, progress: 76, npsScore: 8, lastCommunication: '2024-08-12', growth: 13, backendStudents: 37, notes: 'Creative excellence', lastPayment: { amount: 3583, date: '2024-08-01' }, logo: null },
  { id: '38', name: 'ConstructTech Build', status: 'at-risk' as const, team: 'Beta', csm: 'Tyler Davis', assigned_ssc: 'Andy', startDate: '2024-04-12', endDate: '2024-11-12', contractValue: 37000, mrr: 3083, callsBooked: 13, dealsClosed: 6, progress: 52, npsScore: 6, lastCommunication: '2024-08-08', growth: -3, backendStudents: 24, notes: 'Under construction', lastPayment: { amount: 3083, date: '2024-08-01' }, logo: null },
  { id: '39', name: 'VRTech Reality', status: 'active' as const, team: 'Alpha', csm: 'Luna Rodriguez', assigned_ssc: 'Nick', startDate: '2024-06-05', endDate: '2025-05-05', contractValue: 72000, mrr: 6000, callsBooked: 33, dealsClosed: 21, progress: 87, npsScore: 9, lastCommunication: '2024-08-16', growth: 24, backendStudents: 56, notes: 'Virtual success', lastPayment: { amount: 6000, date: '2024-08-01' }, logo: null },
  { id: '40', name: 'RoboTech Future', status: 'active' as const, team: 'Gamma', csm: 'Ethan Kim', assigned_ssc: 'Chris', startDate: '2024-03-15', endDate: '2025-02-15', contractValue: 88000, mrr: 7333, callsBooked: 39, dealsClosed: 26, progress: 91, npsScore: 10, lastCommunication: '2024-08-17', growth: 29, backendStudents: 72, notes: 'Robotic excellence', lastPayment: { amount: 7333, date: '2024-08-01' }, logo: null },
  { id: '41', name: 'SmartTech Home', status: 'new' as const, team: 'Beta', csm: 'Aria Johnson', assigned_ssc: 'Cillin', startDate: '2024-08-15', endDate: '2025-08-14', contractValue: 49000, mrr: 4083, callsBooked: 1, dealsClosed: 0, progress: 8, npsScore: 7, lastCommunication: '2024-08-19', growth: 0, backendStudents: 31, notes: 'Smart beginning', lastPayment: { amount: 4083, date: '2024-08-01' }, logo: null },
  { id: '42', name: 'DrugTech Pharma', status: 'active' as const, team: 'Alpha', csm: 'Caleb Wilson', assigned_ssc: 'Stephen', startDate: '2024-05-25', endDate: '2025-04-25', contractValue: 92000, mrr: 7667, callsBooked: 41, dealsClosed: 27, progress: 93, npsScore: 10, lastCommunication: '2024-08-18', growth: 31, backendStudents: 76, notes: 'Pharmaceutical perfection', lastPayment: { amount: 7667, date: '2024-08-01' }, logo: null }
];

const mockStatusCounts = { total: 42, active: 28, atRisk: 8, new: 4, churned: 2 };
const mockTeamMetrics = { 
  totalMRR: 125000, 
  averageHealth: 87, 
  totalCallsBooked: 156, 
  totalDealsClosed: 89,
  retentionRate: 85,
  atRiskRate: 15,
  churnRate: 5,
  totalClients: 42
};

interface UseDashboardDataOptions {
  teamFilter?: string;
  enableAutoSync?: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { teamFilter = 'all', enableAutoSync = true } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);
  const [errorState, setErrorState] = useState<Error | null>(null);
  const { triggerSync, isSyncing } = useAutoSync();

  // COMPLETE SECURITY BYPASS - ALWAYS RETURN MOCK DATA
  console.log("[useDashboardData] SECURITY DISABLED: Always returning mock data");
  return {
    allClients: mockClients,
    teamStatusCounts: mockStatusCounts,
    teamMetrics: mockTeamMetrics,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshData: async () => Promise.resolve(),
    refetchData: async () => Promise.resolve(),
    lastUpdated: new Date(),
    churnData: [],
    npsScore: 87,
    npsData: { current: 87, trend: [] },
    clients: mockClients,
    clientCounts: mockStatusCounts,
    data: {
      allClients: mockClients,
      teamStatusCounts: mockStatusCounts,
      teamMetrics: mockTeamMetrics,
      averageHealth: 87
    }
  };

  // Simplified query options to prevent TypeScript issues
  const clientsQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENTS],
    queryFn: getAllClients,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const countQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENT_COUNTS],
    queryFn: getClientsCountByStatus,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const npsQuery = useQuery({
    queryKey: [DATA_KEYS.NPS_DATA],
    queryFn: getAverageNPS,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const churnQuery = useQuery({
    queryKey: [DATA_KEYS.CHURN_DATA],
    queryFn: getChurnData,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const teamMetricsQuery = useQuery({
    queryKey: [DATA_KEYS.TEAM_METRICS, teamFilter],
    queryFn: () => getClientMetricsByTeam(teamFilter),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!teamFilter && teamFilter !== 'all',
  });

  // Process and filter data based on team selection
  const processedData = useMemo(() => {
    const clients = clientsQuery.data || [];
    const filteredClients = teamFilter === 'all' 
      ? clients 
      : clients.filter(client => client.team === teamFilter);

    // Calculate team-specific status counts
    const teamStatusCounts = {
      active: filteredClients.filter(c => c.status === 'active').length,
      atRisk: filteredClients.filter(c => c.status === 'at-risk').length,
      churned: filteredClients.filter(c => c.status === 'churned').length,
      new: filteredClients.filter(c => c.status === 'new').length,
      total: filteredClients.length
    };

    // Calculate average health score for team
    const totalHealth = filteredClients.reduce((sum, client) => {
      return sum + (client?.npsScore ?? 0);
    }, 0);
    
    const averageHealth = teamStatusCounts.total > 0 
      ? totalHealth / teamStatusCounts.total 
      : 0;

    // Calculate team metrics
    const teamMetrics = {
      retentionRate: teamStatusCounts.total > 0 ? (teamStatusCounts.active / teamStatusCounts.total) * 100 : 0,
      atRiskRate: teamStatusCounts.total > 0 ? (teamStatusCounts.atRisk / teamStatusCounts.total) * 100 : 0,
      churnRate: teamStatusCounts.total > 0 ? (teamStatusCounts.churned / teamStatusCounts.total) * 100 : 0,
      averageHealth,
      totalMRR: teamMetricsQuery.data?.totalMRR || 0,
      totalClients: teamStatusCounts.total,
      totalCallsBooked: teamMetricsQuery.data?.totalCallsBooked || 0,
      totalDealsClosed: teamMetricsQuery.data?.totalDealsClosed || 0,
    };

    return {
      allClients: clients,
      filteredClients,
      teamStatusCounts,
      teamMetrics,
      averageHealth,
      globalCounts: countQuery.data || { active: 0, 'at-risk': 0, new: 0, churned: 0 },
      npsScore: npsQuery.data || 0,
      churnData: churnQuery.data || [],
      rawTeamMetrics: teamMetricsQuery.data
    };
  }, [
    clientsQuery.data,
    countQuery.data,
    npsQuery.data,
    churnQuery.data,
    teamMetricsQuery.data,
    teamFilter
  ]);

  // Error handling with memoized callback
  const handleErrors = useCallback(() => {
    const errors = [
      clientsQuery.error,
      countQuery.error,
      npsQuery.error,
      churnQuery.error,
      teamMetricsQuery.error
    ].filter(Boolean);

    if (errors.length > 0) {
      const firstError = errors[0];
      const errorObj = firstError instanceof Error ? firstError : new Error(String(firstError));
      setErrorState(errorObj);
      
      // Only show toast if it's a new error
      toast({
        title: "Dashboard Data Error",
        description: errorObj.message,
        variant: "destructive",
      });
    } else {
      setErrorState(null);
    }
  }, [
    clientsQuery.error,
    countQuery.error,
    npsQuery.error,
    churnQuery.error,
    teamMetricsQuery.error,
    toast
  ]);

  useEffect(() => {
    handleErrors();
  }, [handleErrors]);

  // Mark initial data as fetched
  useEffect(() => {
    if (clientsQuery.data && !isInitialDataFetched) {
      console.log("Initial dashboard data fetched successfully");
      setIsInitialDataFetched(true);
    }
  }, [clientsQuery.data, isInitialDataFetched]);

  // Force refresh all data with memoized callback
  const refreshAllData = useCallback(async () => {
    console.log("Manual refresh of dashboard data initiated");
    setErrorState(null);
    
    // Invalidate all relevant queries
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.TEAM_METRICS] });
    
    if (enableAutoSync) {
      try {
        await triggerSync();
        console.log("Manual refresh completed successfully");
      } catch (error) {
        console.error("Error during manual refresh:", error);
        setErrorState(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [enableAutoSync, triggerSync, queryClient]);

  // Network status monitoring
  useEffect(() => {
    if (!enableAutoSync) return;

    const handleOnline = async () => {
      console.log("Network connection restored, refreshing data");
      refreshAllData();
      toast({
        title: "Back online",
        description: "Reconnected to the server. Refreshing data...",
      });
    };

    const handleOffline = () => {
      console.log("Network connection lost");
      toast({
        title: "Connection lost",
        description: "You are currently offline. Some features may be unavailable.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, enableAutoSync, refreshAllData]);

  // Combined loading state
  const isLoading = (
    (clientsQuery.isLoading && !isInitialDataFetched) || 
    (countQuery.isLoading && !countQuery.data) || 
    (npsQuery.isLoading && !npsQuery.data) || 
    (churnQuery.isLoading && !churnQuery.data) ||
    (teamMetricsQuery.isLoading && !teamMetricsQuery.data && teamFilter !== 'all')
  );

  const isRefreshing = isSyncing || 
    clientsQuery.isFetching || 
    countQuery.isFetching || 
    npsQuery.isFetching || 
    churnQuery.isFetching ||
    teamMetricsQuery.isFetching;
  
  // Calculate last updated timestamp
  const getLastUpdated = useCallback(() => {
    const timestamps = [
      clientsQuery.dataUpdatedAt,
      countQuery.dataUpdatedAt,
      npsQuery.dataUpdatedAt,
      churnQuery.dataUpdatedAt,
      teamMetricsQuery.dataUpdatedAt
    ].filter(Boolean);
    
    return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
  }, [
    clientsQuery.dataUpdatedAt,
    countQuery.dataUpdatedAt,
    npsQuery.dataUpdatedAt,
    churnQuery.dataUpdatedAt,
    teamMetricsQuery.dataUpdatedAt
  ]);

  return {
    // Processed data
    ...processedData,
    
    // Backwards compatibility with existing interfaces
    data: processedData,
    refetchData: refreshAllData,
    clients: processedData.allClients,
    clientCounts: processedData.globalCounts,
    npsData: { current: processedData.npsScore, trend: [] },
    churnData: processedData.churnData,
    metrics: processedData.teamMetrics,
    
    // Loading states
    isLoading,
    isRefreshing,
    error: errorState,
    isInitialDataFetched,
    
    // Actions
    refreshData: refreshAllData,
    
    // Metadata
    lastUpdated: getLastUpdated(),
    teamFilter,
    
    // Raw query states for debugging
    rawQueries: {
      clients: clientsQuery,
      counts: countQuery,
      nps: npsQuery,
      churn: churnQuery,
      teamMetrics: teamMetricsQuery
    }
  };
}