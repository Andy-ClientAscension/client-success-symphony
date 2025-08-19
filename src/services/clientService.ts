import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/lib/data';
import { validateClient } from '@/utils/clientValidation';

export interface ClientQuery {
  teamFilter?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ClientMutationData {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'at-risk' | 'new' | 'churned' | 'backend' | 'olympia' | 'paused' | 'graduated';
  team?: string;
  csm?: string;
  progress?: number;
  mrr?: number;
  nps_score?: number;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  assigned_ssc?: string;
  notes?: string;
}

export class ClientService {
  private static instance: ClientService;
  
  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  async getClient(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? validateClient(data) : null;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async getClients(query: ClientQuery = {}): Promise<Client[]> {
    try {
      let supabaseQuery = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (query.teamFilter && query.teamFilter !== 'all') {
        supabaseQuery = supabaseQuery.eq('team', query.teamFilter);
      }

      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status);
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query.search}%,email.ilike.%${query.search}%`
        );
      }

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 50) - 1);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return (data || []).map(client => validateClient(client)).filter(Boolean) as Client[];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async createClient(clientData: ClientMutationData): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      const validatedClient = validateClient(data);
      if (!validatedClient) throw new Error('Invalid client data returned');
      return validatedClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, updates: ClientMutationData): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const validatedClient = validateClient(data);
      if (!validatedClient) throw new Error('Invalid client data returned');
      return validatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Dashboard aggregation methods
  async getClientCounts(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('status');

      if (error) throw error;

      const counts = (data || []).reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        active: counts.active || 0,
        'at-risk': counts['at-risk'] || 0,
        new: counts.new || 0,
        churned: counts.churned || 0,
        ...counts
      };
    } catch (error) {
      console.error('Error fetching client counts:', error);
      throw error;
    }
  }

  async getClientMetrics(): Promise<{
    totalMRR: number;
    avgHealthScore: number;
    retentionRate: number;
    avgNPS: number;
    averageHealth: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    atRiskRate: number;
    churnRate: number;
  }> {
    try {
      const clients = await this.getClients();
      
      const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
      const avgHealthScore = clients.length > 0 
        ? clients.reduce((sum, client) => sum + (client.progress || 0), 0) / clients.length
        : 0;
      const activeClients = clients.filter(client => client.status === 'active').length;
      const atRiskClients = clients.filter(client => client.status === 'at-risk').length;
      const churnedClients = clients.filter(client => client.status === 'churned').length;
      const totalClients = clients.length || 1;
      
      const retentionRate = clients.length > 0 ? (activeClients / clients.length) * 100 : 0;
      const avgNPS = clients.length > 0
        ? clients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clients.length
        : 0;
      const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
      const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
      const atRiskRate = (atRiskClients / totalClients) * 100;
      const churnRate = (churnedClients / totalClients) * 100;

      return {
        totalMRR,
        avgHealthScore: Math.round(avgHealthScore),
        retentionRate: Math.round(retentionRate),
        avgNPS: Math.round(avgNPS * 10) / 10,
        averageHealth: Math.round(avgHealthScore),
        totalCallsBooked,
        totalDealsClosed,
        atRiskRate: Math.round(atRiskRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10
      };
    } catch (error) {
      console.error('Error fetching client metrics:', error);
      throw error;
    }
  }
}

export const clientService = ClientService.getInstance();