import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Shield, Crown } from 'lucide-react';
import { useProfiles, type Profile } from '@/hooks/useProfiles';
import { LoadingState } from '@/components/LoadingState';

export function UserProfilesTable() {
  const { profiles, loading, changeUserRole } = useProfiles();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'manager' | 'user') => {
    setUpdating(userId);
    try {
      await changeUserRole(userId, newRole);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'manager': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (profile: Profile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
    }
    return profile.email[0].toUpperCase();
  };

  const getDisplayName = (profile: Profile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email;
  };

  const getCurrentRole = (profile: Profile) => {
    return profile.user_roles?.[0]?.role || 'user';
  };

  if (loading) {
    return <LoadingState message="Loading user profiles..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Badge variant="secondary">
          {profiles.length} user{profiles.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => {
              const currentRole = getCurrentRole(profile);
              return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{getDisplayName(profile)}</p>
                        {profile.first_name && (
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(currentRole)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(currentRole)}
                        {currentRole}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updating === profile.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(profile.id, 'user')}
                          disabled={currentRole === 'user'}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(profile.id, 'manager')}
                          disabled={currentRole === 'manager'}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Set as Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(profile.id, 'admin')}
                          disabled={currentRole === 'admin'}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Set as Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}