import React, { useState } from 'react';
import { Mail, Phone, DollarSign, Heart, TrendingUp, Calendar, Edit, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Client } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface SSCClientCardProps {
  client: Client;
}

export function SSCClientCard({ client }: SSCClientCardProps) {
  const { toast } = useToast();
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const handleEdit = () => {
    toast({
      title: "Edit Client",
      description: `Opening edit form for ${client.name}`,
    });
    // In a real app, this would navigate to edit page or open edit modal
    console.log('Edit client:', client.id);
  };

  const handleViewDetails = () => {
    setIsViewDetailsOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'at-risk': return 'destructive';
      case 'churned': return 'secondary';
      case 'new': return 'default';
      default: return 'outline';
    }
  };

  const getHealthScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.logo} alt={client.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.csm}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(client.status)} className="capitalize">
            {client.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Contact Info */}
        {(client.email || client.phone) && (
          <div className="space-y-2 mb-4">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Service */}
        {client.service && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {client.service}
            </Badge>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">MRR</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(client.mrr)}
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Health</span>
            </div>
            <div className={`text-lg font-bold ${getHealthScoreColor(client.health_score)}`}>
              {client.health_score || 'N/A'}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">NPS:</span>
            <span className="font-medium">{client.npsScore || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{client.progress || 0}%</span>
          </div>
        </div>

        {/* Contract Info */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contract Value:</span>
            <span className="font-medium">{formatCurrency(client.contractValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">End Date:</span>
            <span className="font-medium">
              {new Date(client.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2" 
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={client.logo} alt={client.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {client.name} - Detailed View
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {client.name}</div>
                  <div><strong>CSM:</strong> {client.csm}</div>
                  <div><strong>Team:</strong> {client.team || 'N/A'}</div>
                  <div><strong>Status:</strong> 
                    <Badge variant={getStatusVariant(client.status)} className="ml-2 capitalize">
                      {client.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {client.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {client.phone || 'N/A'}</div>
                  <div><strong>Service:</strong> {client.service || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div>
              <h3 className="font-semibold mb-2">Financial Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(client.mrr)}
                  </div>
                  <div className="text-sm text-muted-foreground">MRR</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    {formatCurrency(client.contractValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Contract Value</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{client.callsBooked || 0}</div>
                  <div className="text-sm text-muted-foreground">Calls Booked</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{client.dealsClosed || 0}</div>
                  <div className="text-sm text-muted-foreground">Deals Closed</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className={`text-lg font-bold ${getHealthScoreColor(client.health_score)}`}>
                    {client.health_score || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{client.npsScore || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">NPS Score</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{client.progress || 0}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{client.backendStudents || 0}</div>
                  <div className="text-sm text-muted-foreground">Backend Students</div>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div>
              <h3 className="font-semibold mb-2">Contract Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Start Date:</strong> {new Date(client.startDate).toLocaleDateString()}</div>
                <div><strong>End Date:</strong> {new Date(client.endDate).toLocaleDateString()}</div>
                <div><strong>Last Communication:</strong> {client.lastCommunication ? new Date(client.lastCommunication).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Growth:</strong> {client.growth ? `${client.growth}%` : 'N/A'}</div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {client.notes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}