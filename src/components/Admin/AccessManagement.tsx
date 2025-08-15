import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Key, Shield, UserX, Clock, CheckCircle } from "lucide-react";

interface UserAccess {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  last_sign_in?: string;
  created_at: string;
  is_active: boolean;
}

export function AccessManagement() {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAccess();
  }, []);

  const fetchUserAccess = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          user_roles (
            role
          )
        `);

      if (profilesError) throw profilesError;

      // Get auth user data to check activity status
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      const usersWithAccess = profiles?.map(profile => {
        const authUser = authUsers?.users?.find(u => u.id === profile.id);
        return {
          ...profile,
          roles: profile.user_roles?.map(ur => ur.role) || [],
          last_sign_in: authUser?.last_sign_in_at,
          is_active: !!authUser && !authUser.banned_until
        };
      }) || [];

      setUsers(usersWithAccess);
    } catch (error) {
      console.error('Error fetching user access:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user access data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeUserAccess = async (userId: string) => {
    try {
      // Remove all user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Ban the user (requires admin privileges)
      // Note: This might need to be done through an edge function with service role
      toast({
        title: "Success", 
        description: "User access revoked successfully"
      });

      fetchUserAccess();
    } catch (error) {
      console.error('Error revoking user access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke user access",
        variant: "destructive"
      });
    }
  };

  const restoreUserAccess = async (userId: string, role: string = 'user') => {
    try {
      // Restore user role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User access restored successfully"
      });

      fetchUserAccess();
    } catch (error) {
      console.error('Error restoring user access:', error);
      toast({
        title: "Error",
        description: "Failed to restore user access",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && user.is_active && user.roles.length > 0) ||
                         (selectedStatus === "inactive" && (!user.is_active || user.roles.length === 0)) ||
                         (selectedStatus === "no-role" && user.roles.length === 0);
    
    return matchesSearch && matchesStatus;
  });

  const getAccessStatusBadge = (user: UserAccess) => {
    if (!user.is_active) return <Badge variant="destructive">Disabled</Badge>;
    if (user.roles.length === 0) return <Badge variant="outline">No Access</Badge>;
    if (user.roles.includes('admin')) return <Badge variant="default">Admin Access</Badge>;
    if (user.roles.includes('manager')) return <Badge variant="secondary">Manager Access</Badge>;
    return <Badge variant="secondary">User Access</Badge>;
  };

  const getLastSignInText = (lastSignIn?: string) => {
    if (!lastSignIn) return "Never";
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Management</CardTitle>
          <CardDescription>Loading access data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Access Management
          </CardTitle>
          <CardDescription>
            Manage user access permissions and revoke access when needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Access</SelectItem>
                <SelectItem value="inactive">No Access</SelectItem>
                <SelectItem value="no-role">No Role Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Account Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAccessStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {getLastSignInText(user.last_sign_in)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {user.roles.length > 0 ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <UserX className="h-4 w-4 mr-1" />
                                Revoke Access
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke User Access</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke access for {user.email}? This will:
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Remove all roles and permissions</li>
                                    <li>Prevent the user from accessing the system</li>
                                    <li>Require admin intervention to restore access</li>
                                  </ul>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeUserAccess(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-600">
                                <Shield className="h-4 w-4 mr-1" />
                                Restore Access
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restore User Access</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">User</label>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Assign Role</label>
                                  <Select onValueChange={(value) => restoreUserAccess(user.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role to assign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}