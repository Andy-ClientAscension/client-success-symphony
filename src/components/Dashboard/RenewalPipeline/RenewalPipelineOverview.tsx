import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";

interface ClientRenewal {
  id: string;
  name: string;
  end_date: string;
  contract_value: number;
  status: string;
  team: string;
  assigned_ssc: string;
  days_to_renewal: number;
  renewal_category: 'past_due' | 'upcoming' | 'pipeline' | 'future';
}

export function RenewalPipelineOverview() {
  const [renewals, setRenewals] = useState<ClientRenewal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRenewalPipeline();
  }, []);

  const fetchRenewalPipeline = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, end_date, contract_value, status, team, assigned_ssc')
        .in('status', ['active', 'at-risk'])
        .order('end_date', { ascending: true });

      if (error) throw error;

      const renewalsWithCategories = data.map(client => {
        const daysToRenewal = differenceInDays(new Date(client.end_date), new Date());
        let category: ClientRenewal['renewal_category'];
        
        if (daysToRenewal < 0) category = 'past_due';
        else if (daysToRenewal <= 30) category = 'upcoming';
        else if (daysToRenewal <= 90) category = 'pipeline';
        else category = 'future';

        return {
          ...client,
          days_to_renewal: daysToRenewal,
          renewal_category: category
        };
      });

      setRenewals(renewalsWithCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load renewal pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const pastDue = renewals.filter(r => r.renewal_category === 'past_due');
    const upcoming = renewals.filter(r => r.renewal_category === 'upcoming');
    const pipeline = renewals.filter(r => r.renewal_category === 'pipeline');
    
    return {
      pastDue: {
        count: pastDue.length,
        value: pastDue.reduce((sum, r) => sum + r.contract_value, 0)
      },
      upcoming: {
        count: upcoming.length,
        value: upcoming.reduce((sum, r) => sum + r.contract_value, 0)
      },
      pipeline: {
        count: pipeline.length,
        value: pipeline.reduce((sum, r) => sum + r.contract_value, 0)
      },
      total: {
        count: renewals.length,
        value: renewals.reduce((sum, r) => sum + r.contract_value, 0)
      }
    };
  }, [renewals]);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'past_due': return 'destructive';
      case 'upcoming': return 'secondary';
      case 'pipeline': return 'default';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'past_due': return <AlertTriangle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'pipeline': return <TrendingUp className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-red-500">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Past Due</p>
                <p className="text-2xl font-bold">{stats.pastDue.count}</p>
                <p className="text-xs text-muted-foreground">
                  ${stats.pastDue.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Next 30 Days</p>
                <p className="text-2xl font-bold">{stats.upcoming.count}</p>
                <p className="text-xs text-muted-foreground">
                  ${stats.upcoming.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pipeline (90d)</p>
                <p className="text-2xl font-bold">{stats.pipeline.count}</p>
                <p className="text-xs text-muted-foreground">
                  ${stats.pipeline.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Pipeline</p>
                <p className="text-2xl font-bold">{stats.total.count}</p>
                <p className="text-xs text-muted-foreground">
                  ${stats.total.value.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Renewal List */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Pipeline Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {renewals.slice(0, 10).map(renewal => (
              <div 
                key={renewal.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(renewal.renewal_category)}
                  <div>
                    <div className="font-medium">{renewal.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {renewal.team} • {renewal.assigned_ssc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {format(new Date(renewal.end_date), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {renewal.days_to_renewal < 0 
                        ? `${Math.abs(renewal.days_to_renewal)} days overdue`
                        : `${renewal.days_to_renewal} days remaining`
                      }
                    </div>
                  </div>
                  
                  <Badge variant={getCategoryColor(renewal.renewal_category)}>
                    {renewal.renewal_category.replace('_', ' ')}
                  </Badge>
                  
                  <div className="text-right font-medium">
                    ${renewal.contract_value.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {renewals.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing 10 of {renewals.length} renewals. View all in detailed reports.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}