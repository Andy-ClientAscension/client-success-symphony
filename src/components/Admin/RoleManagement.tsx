import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, TrendingUp } from 'lucide-react';

interface RoleStats {
  role: string;
  count: number;
  description: string;
}

export function RoleManagement() {
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const roleDescriptions = {
    admin: 'Full system access and user management',
    manager: 'Team management and reporting access',
    ssc: 'Student Success Coach with client management',
    user: 'Basic user with limited access'
  };

  useEffect(() => {
    fetchRoleStats();
  }, []);

  const fetchRoleStats = async () => {
    try {
      setLoading(true);
      
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role');

      if (error) throw error;

      // Count roles
      const roleCounts = roleData?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const stats = Object.entries(roleDescriptions).map(([role, description]) => ({
        role,
        count: roleCounts[role] || 0,
        description
      }));

      setRoleStats(stats);
    } catch (error) {
      console.error('Error fetching role stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch role statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading role statistics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleStats.map((stat) => (
              <div key={stat.role} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {stat.role}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {stat.count}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Admin Permissions</h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Full system access</li>
                  <li>• User and role management</li>
                  <li>• Database administration</li>
                  <li>• System settings</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Manager Permissions</h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Team oversight</li>
                  <li>• Performance analytics</li>
                  <li>• Client management</li>
                  <li>• Reporting access</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">SSC Permissions</h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Client relationship management</li>
                  <li>• Student progress tracking</li>
                  <li>• Communication tools</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">User Permissions</h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                  <li>• Basic dashboard access</li>
                  <li>• Personal profile management</li>
                  <li>• Limited reporting</li>
                  <li>• Notification settings</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}