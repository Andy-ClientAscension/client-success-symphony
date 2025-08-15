import React, { useState } from 'react';
import { Mail, Phone, DollarSign, Heart, TrendingUp, Calendar, Edit, Eye, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { DaysRemaining } from '@/components/ui/days-remaining';
import { RiskIndicator, PaymentIndicator, calculateRiskLevel, calculatePaymentStatus } from '@/components/ui/status-indicators';
import { Client } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface SSCClientCardProps {
  client: Client;
}

export function SSCClientCard({ client }: SSCClientCardProps) {
  const { toast } = useToast();
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    service: client.service || '',
    other_service_details: client.service?.startsWith('Other:') ? client.service.replace('Other: ', '') : '',
    mrr: client.mrr?.toString() || '',
    health_score: client.health_score?.toString() || '',
    nps_score: client.npsScore?.toString() || '',
    contract_value: client.contractValue?.toString() || '',
    status: client.status as "new" | "active" | "backend" | "olympia" | "at-risk" | "churned" | "paused" | "graduated",
    csm: client.csm || '',
    notes: client.notes || ''
  });

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    // Validate Other service details if "Other" is selected
    if (editForm.service === 'Other' && !editForm.other_service_details.trim()) {
      toast({
        title: "Validation Error",
        description: "Please specify the service details for 'Other' service type.",
        variant: "destructive"
      });
      return;
    }

    // Prepare service value - combine "Other" with details if needed
    const serviceValue = editForm.service === 'Other' 
      ? `Other: ${editForm.other_service_details}` 
      : editForm.service;

    // In a real app, this would make an API call to update the client
    toast({
      title: "Client Updated",
      description: `${editForm.name} has been successfully updated.`,
    });
    console.log('Updated client data:', {
      id: client.id,
      ...editForm,
      service: serviceValue,
      mrr: parseFloat(editForm.mrr) || 0,
      health_score: parseInt(editForm.health_score) || 0,
      nps_score: parseInt(editForm.nps_score) || 0,
      contract_value: parseFloat(editForm.contract_value) || 0
    });
    setIsEditOpen(false);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      service: client.service || '',
      other_service_details: client.service?.startsWith('Other:') ? client.service.replace('Other: ', '') : '',
      mrr: client.mrr?.toString() || '',
      health_score: client.health_score?.toString() || '',
      nps_score: client.npsScore?.toString() || '',
      contract_value: client.contractValue?.toString() || '',
      status: client.status,
      csm: client.csm || '',
      notes: client.notes || ''
    });
    setIsEditOpen(false);
  };

  const handleViewDetails = () => {
    setIsViewDetailsOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'active': return 'default';
      case 'caution': return 'destructive'; 
      case 'at-risk': return 'destructive';
      case 'not-active': return 'destructive';
      case 'churned': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-client-new text-white';
      case 'active': return 'bg-client-active text-white';
      case 'caution': return 'bg-client-caution text-white';
      case 'at-risk': return 'bg-client-caution text-white';
      case 'not-active': return 'bg-client-not-active text-white';
      case 'churned': return 'bg-client-not-active text-white';
      default: return 'bg-muted text-muted-foreground';
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
          <Badge className={`${getStatusColorClass(client.status)} capitalize border-0`}>
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

        {/* Risk and Payment Status Indicators */}
        <div className="flex flex-wrap gap-2 mb-4">
          <RiskIndicator 
            riskLevel={calculateRiskLevel(client)} 
            size="sm"
          />
          <PaymentIndicator 
            paymentStatus={calculatePaymentStatus(client)}
            lastPaymentDate={client.lastPayment?.date}
            size="sm"
          />
        </div>

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
        <div className="border-t pt-4 space-y-3">
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
          
          {/* Days Remaining Display */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Contract Status:</span>
            <DaysRemaining 
              endDate={client.endDate} 
              contractType={client.contract_type}
              className="justify-end"
            />
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
            {/* Status Indicators */}
            <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
              <RiskIndicator 
                riskLevel={calculateRiskLevel(client)} 
                size="default"
              />
              <PaymentIndicator 
                paymentStatus={calculatePaymentStatus(client)}
                lastPaymentDate={client.lastPayment?.date}
                size="default"
              />
              <DaysRemaining 
                endDate={client.endDate} 
                contractType={client.contract_type}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {client.name}</div>
                  <div><strong>CSM:</strong> {client.csm}</div>
                  <div><strong>Team:</strong> {client.team || 'N/A'}</div>
                  <div><strong>Status:</strong> 
                    <Badge className={`${getStatusColorClass(client.status)} ml-2 capitalize border-0`}>
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

      {/* Edit Client Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Edit className="h-5 w-5" />
              Edit Client - {client.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormWrapper id="name" label="Client Name" required>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client name"
                />
              </FormWrapper>

              <FormWrapper id="status" label="Status">
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as "new" | "active" | "backend" | "olympia" | "at-risk" | "churned" | "paused" | "graduated" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="olympia">Olympia</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </FormWrapper>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormWrapper id="email" label="Email">
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                />
              </FormWrapper>

              <FormWrapper id="phone" label="Phone">
                <Input
                  id="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </FormWrapper>
            </div>

            {/* Service & CSM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormWrapper id="service" label="Service">
                <Select
                  value={editForm.service}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cold Email Agency">Cold Email Agency</SelectItem>
                    <SelectItem value="Email Marketing">Email Marketing</SelectItem>
                    <SelectItem value="Paid Ads">Paid Ads</SelectItem>
                    <SelectItem value="Funnel Build">Funnel Build</SelectItem>
                    <SelectItem value="AI Automation">AI Automation</SelectItem>
                    <SelectItem value="Coaching">Coaching</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Content Creation">Content Creation</SelectItem>
                    <SelectItem value="Growth Partner">Growth Partner</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Info Owner">Info Owner</SelectItem>
                    <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="SEO Optimization">SEO Optimization</SelectItem>
                    <SelectItem value="Social Media Management">Social Media Management</SelectItem>
                    <SelectItem value="PPC Advertising">PPC Advertising</SelectItem>
                    <SelectItem value="Analytics & Reporting">Analytics & Reporting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormWrapper>

              <FormWrapper id="csm" label="CSM/SSC">
                <Select
                  value={editForm.csm}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, csm: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Andy">Andy</SelectItem>
                    <SelectItem value="Nick">Nick</SelectItem>
                    <SelectItem value="Chris">Chris</SelectItem>
                    <SelectItem value="Cillin">Cillin</SelectItem>
                    <SelectItem value="Stephen">Stephen</SelectItem>
                  </SelectContent>
                </Select>
              </FormWrapper>
            </div>

            {/* Other Service Details - Conditional Field */}
            {editForm.service === 'Other' && (
              <div className="grid grid-cols-1 gap-4">
                <FormWrapper id="other_service_details" label="Other Service Details" required>
                  <Input
                    id="other_service_details"
                    value={editForm.other_service_details}
                    onChange={(e) => setEditForm(prev => ({ ...prev, other_service_details: e.target.value }))}
                    placeholder="Please specify the service details"
                    required={editForm.service === 'Other'}
                  />
                </FormWrapper>
              </div>
            )}

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormWrapper id="mrr" label="MRR ($)">
                <Input
                  id="mrr"
                  type="number"
                  value={editForm.mrr}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mrr: e.target.value }))}
                  placeholder="5000"
                  min="0"
                />
              </FormWrapper>

              <FormWrapper id="contract_value" label="Contract Value ($)">
                <Input
                  id="contract_value"
                  type="number"
                  value={editForm.contract_value}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contract_value: e.target.value }))}
                  placeholder="50000"
                  min="0"
                />
              </FormWrapper>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormWrapper id="health_score" label="Health Score (0-100)">
                <Input
                  id="health_score"
                  type="number"
                  value={editForm.health_score}
                  onChange={(e) => setEditForm(prev => ({ ...prev, health_score: e.target.value }))}
                  placeholder="85"
                  min="0"
                  max="100"
                />
              </FormWrapper>

              <FormWrapper id="nps_score" label="NPS Score (-100 to 100)">
                <Input
                  id="nps_score"
                  type="number"
                  value={editForm.nps_score}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nps_score: e.target.value }))}
                  placeholder="50"
                  min="-100"
                  max="100"
                />
              </FormWrapper>
            </div>

            {/* Notes */}
            <FormWrapper id="notes" label="Notes">
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this client..."
                rows={3}
              />
            </FormWrapper>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}