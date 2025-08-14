import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Client } from '@/lib/data';

// Mock client data for development mode
const mockClientData: Client[] = [
  {
    id: '1',
    name: 'TechCorp Inc',
    status: 'active',
    team: 'Alpha',
    csm: 'John Smith',
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    contractValue: 50000,
    mrr: 4167,
    callsBooked: 25,
    dealsClosed: 12,
    progress: 85,
    npsScore: 9,
    lastCommunication: '2024-08-10',
    growth: 15,
    backendStudents: 45,
    logo: null,
    notes: 'Excellent progress, on track for renewal',
    lastPayment: { amount: 4167, date: '2024-08-01' }
  },
  {
    id: '2',
    name: 'StartupX',
    status: 'at-risk',
    team: 'Beta',
    csm: 'Sarah Johnson',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    contractValue: 25000,
    mrr: 2083,
    callsBooked: 12,
    dealsClosed: 5,
    progress: 60,
    npsScore: 6,
    lastCommunication: '2024-08-05',
    growth: -5,
    backendStudents: 20,
    logo: null,
    notes: 'Needs attention - declining engagement',
    lastPayment: { amount: 2083, date: '2024-08-01' }
  },
  {
    id: '3',
    name: 'Enterprise Solutions',
    status: 'active',
    team: 'Gamma',
    csm: 'Mike Davis',
    startDate: '2024-03-10',
    endDate: '2025-02-10',
    contractValue: 100000,
    mrr: 8333,
    callsBooked: 40,
    dealsClosed: 28,
    progress: 92,
    npsScore: 10,
    lastCommunication: '2024-08-12',
    growth: 25,
    backendStudents: 80,
    logo: null,
    notes: 'Top performer, excellent results',
    lastPayment: { amount: 8333, date: '2024-08-01' }
  },
  {
    id: '4',
    name: 'Digital Dynamics',
    status: 'new',
    team: 'Alpha',
    csm: 'Lisa Wilson',
    startDate: '2024-08-01',
    endDate: '2025-07-31',
    contractValue: 75000,
    mrr: 6250,
    callsBooked: 8,
    dealsClosed: 2,
    progress: 30,
    npsScore: 8,
    lastCommunication: '2024-08-14',
    growth: 0,
    backendStudents: 35,
    logo: null,
    notes: 'New client, onboarding in progress',
    lastPayment: { amount: 6250, date: '2024-08-01' }
  },
  {
    id: '5',
    name: 'InnovateTech',
    status: 'active',
    team: 'Beta',
    csm: 'Tom Anderson',
    startDate: '2024-04-15',
    endDate: '2025-03-15',
    contractValue: 60000,
    mrr: 5000,
    callsBooked: 30,
    dealsClosed: 18,
    progress: 78,
    npsScore: 8,
    lastCommunication: '2024-08-11',
    growth: 12,
    backendStudents: 55,
    logo: null,
    notes: 'Strong performance, good engagement',
    lastPayment: { amount: 5000, date: '2024-08-01' }
  }
];

interface ClientDataHook {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientData(): ClientDataHook {
  // DEV MODE BYPASS - Return mock data immediately
  if (process.env.NODE_ENV === 'development') {
    const devBypass = localStorage.getItem('dev_auth_bypass');
    if (devBypass) {
      try {
        const { timestamp } = JSON.parse(devBypass);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          console.log("[useClientData] DEV BYPASS: Returning mock client data");
          return {
            clients: mockClientData,
            loading: false,
            error: null,
            refetch: async () => Promise.resolve()
          };
        }
      } catch (e) {
        localStorage.removeItem('dev_auth_bypass');
      }
    }
  }

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      // Transform Supabase data to match Client interface
      const transformedClients: Client[] = (data || []).map(client => ({
        id: client.id,
        name: client.name,
        status: client.status as Client['status'],
        team: client.team,
        csm: client.csm || client.assigned_ssc,
        startDate: client.start_date,
        endDate: client.end_date,
        contractValue: Number(client.contract_value),
        notes: client.notes,
        progress: client.progress,
        npsScore: client.nps_score,
        callsBooked: client.calls_booked,
        dealsClosed: client.deals_closed,
        mrr: Number(client.mrr),
        lastCommunication: client.last_communication,
        backendStudents: client.backend_students,
        growth: Number(client.growth),
        logo: client.logo,
        // New SSC management fields
        email: client.email,
        phone: client.phone,
        service: client.service,
        health_score: client.health_score,
        assigned_ssc: client.assigned_ssc,
        lastPayment: client.last_payment_amount && client.last_payment_date ? {
          amount: Number(client.last_payment_amount),
          date: client.last_payment_date
        } : undefined,
        trustPilotReview: client.trustpilot_date || client.trustpilot_rating || client.trustpilot_link ? {
          date: client.trustpilot_date,
          rating: client.trustpilot_rating,
          link: client.trustpilot_link
        } : undefined,
        caseStudyInterview: {
          completed: client.case_study_completed,
          scheduledDate: client.case_study_scheduled_date,
          conducted: client.case_study_conducted,
          notes: client.case_study_notes || ''
        },
        referrals: {
          count: client.referral_count,
          names: client.referral_names || []
        }
      }));

      setClients(transformedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      
      // Fallback to empty array on error
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients
  };
}