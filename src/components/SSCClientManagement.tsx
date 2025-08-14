import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SSCClientCard } from './SSCClientCard';
import { AddClientDialog } from './AddClientDialog';
import { useClientData } from '@/hooks/useClientData';
import { Client } from '@/lib/data';

const SSC_LIST = ['All SSCs', 'Andy', 'Nick', 'Chris', 'Cillin', 'Stephen'];

export function SSCClientManagement() {
  const { clients, loading, error } = useClientData();
  const [selectedSSC, setSelectedSSC] = useState('All SSCs');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filter by SSC
    if (selectedSSC !== 'All SSCs') {
      filtered = filtered.filter(client => client.csm === selectedSSC);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.team?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [clients, selectedSSC, searchTerm]);

  const getSSCStats = (sscName: string) => {
    const sscClients = clients.filter(client => client.csm === sscName);
    return {
      total: sscClients.length,
      active: sscClients.filter(c => c.status === 'active').length,
      atRisk: sscClients.filter(c => c.status === 'at-risk').length,
      avgMRR: sscClients.reduce((sum, c) => sum + (c.mrr || 0), 0) / sscClients.length || 0
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error loading clients: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SSC Client Management</h1>
          <p className="text-muted-foreground">Manage clients by Student Success Coordinator</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* SSC Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {SSC_LIST.slice(1).map((ssc) => {
          const stats = getSSCStats(ssc);
          return (
            <Card key={ssc} className="relative">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{ssc}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="default" className="text-xs">{stats.active} Active</Badge>
                      <Badge variant="destructive" className="text-xs">{stats.atRisk} At Risk</Badge>
                    </div>
                    <p className="text-sm font-medium">${stats.avgMRR.toFixed(0)} Avg MRR</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSSC} onValueChange={setSelectedSSC}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select SSC" />
                </SelectTrigger>
                <SelectContent>
                  {SSC_LIST.map((ssc) => (
                    <SelectItem key={ssc} value={ssc}>{ssc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <SSCClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No clients found matching your filters.</p>
          </CardContent>
        </Card>
      )}

      <AddClientDialog 
        open={isAddClientOpen} 
        onOpenChange={setIsAddClientOpen}
        selectedSSC={selectedSSC !== 'All SSCs' ? selectedSSC : undefined}
      />
    </div>
  );
}