import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Client } from '@/lib/data';

interface ClientDataHook {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientData(): ClientDataHook {
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