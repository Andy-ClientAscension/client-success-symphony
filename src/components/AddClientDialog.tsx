import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSSC?: string;
}

const SSC_OPTIONS = ['Andy', 'Nick', 'Chris', 'Cillin', 'Stephen'];
const SERVICE_OPTIONS = [
  'Cold Email Agency',
  'Email Marketing',
  'Paid Ads',
  'Funnel Build',
  'AI Automation',
  'Coaching',
  'Finance',
  'Content Creation',
  'Growth Partner',
  'Coach',
  'Info Owner',
  'Digital Marketing',
  'Web Development', 
  'SEO Optimization',
  'Social Media Management',
  'PPC Advertising',
  'Analytics & Reporting',
  'Other'
];

export function AddClientDialog({ open, onOpenChange, selectedSSC }: AddClientDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    other_service_details: '',
    mrr: '',
    health_score: '',
    nps_score: '',
    assigned_ssc: selectedSSC || '',
    contract_value: '',
    start_date: new Date().toISOString().split('T')[0],
    contract_type: '',
    contract_duration_months: '',
    status: 'new'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      other_service_details: '',
      mrr: '',
      health_score: '',
      nps_score: '',
      assigned_ssc: selectedSSC || '',
      contract_value: '',
      start_date: new Date().toISOString().split('T')[0],
      contract_type: '',
      contract_duration_months: '',
      status: 'new'
    });
  };

  // Calculate end date automatically when start date or duration changes
  const calculateEndDate = (startDate: string, durationMonths: string) => {
    if (!startDate || !durationMonths) return '';
    
    const start = new Date(startDate);
    const duration = parseInt(durationMonths);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + duration);
    
    return endDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.assigned_ssc) {
        toast({
          title: "Validation Error",
          description: "Name, email, and SSC assignment are required.",
          variant: "destructive"
        });
        return;
      }

      // Validate Other service details if "Other" is selected
      if (formData.service === 'Other' && !formData.other_service_details.trim()) {
        toast({
          title: "Validation Error",
          description: "Please specify the service details for 'Other' service type.",
          variant: "destructive"
        });
        return;
      }

      // Prepare data for insertion
      const serviceValue = formData.service === 'Other' 
        ? `Other: ${formData.other_service_details}` 
        : formData.service;
        
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        service: serviceValue || null,
        mrr: formData.mrr ? Number(formData.mrr) : 0,
        health_score: formData.health_score ? Number(formData.health_score) : null,
        nps_score: formData.nps_score ? Number(formData.nps_score) : null,
        assigned_ssc: formData.assigned_ssc,
        csm: formData.assigned_ssc, // Keep both for compatibility
        contract_value: formData.contract_value ? Number(formData.contract_value) : 0,
        start_date: formData.start_date || new Date().toISOString().split('T')[0],
        end_date: calculateEndDate(formData.start_date, formData.contract_duration_months) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contract_type: formData.contract_type || null,
        contract_duration_months: formData.contract_duration_months ? Number(formData.contract_duration_months) : null,
        status: formData.status,
        progress: 0,
        calls_booked: 0,
        deals_closed: 0,
        backend_students: 0,
        growth: 0
      };

      const { error } = await supabase
        .from('clients')
        .insert([clientData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Client ${formData.name} has been added successfully.`,
      });

      resetForm();
      onOpenChange(false);
      window.location.reload(); // Refresh to show new client

    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormWrapper id="name" label="Client Name" required>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter client name"
                required
              />
            </FormWrapper>

            <FormWrapper id="assigned_ssc" label="Assigned SSC" required>
              <Select
                value={formData.assigned_ssc}
                onValueChange={(value) => handleInputChange('assigned_ssc', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SSC" />
                </SelectTrigger>
                <SelectContent>
                  {SSC_OPTIONS.map((ssc) => (
                    <SelectItem key={ssc} value={ssc}>{ssc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormWrapper>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormWrapper id="email" label="Email" required>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="client@example.com"
                required
              />
            </FormWrapper>

            <FormWrapper id="phone" label="Phone">
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </FormWrapper>
          </div>

          {/* Service & Contract */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormWrapper id="service" label="Service">
              <Select
                value={formData.service}
                onValueChange={(value) => handleInputChange('service', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_OPTIONS.map((service) => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormWrapper>

            <FormWrapper id="contract_value" label="Contract Value">
              <Input
                id="contract_value"
                type="number"
                value={formData.contract_value}
                onChange={(e) => handleInputChange('contract_value', e.target.value)}
                placeholder="50000"
                min="0"
              />
            </FormWrapper>
          </div>

          {/* Other Service Details - Conditional Field */}
          {formData.service === 'Other' && (
            <div className="grid grid-cols-1 gap-4">
              <FormWrapper id="other_service_details" label="Other Service Details" required>
                <Input
                  id="other_service_details"
                  value={formData.other_service_details}
                  onChange={(e) => handleInputChange('other_service_details', e.target.value)}
                  placeholder="Please specify the service details"
                  required={formData.service === 'Other'}
                />
              </FormWrapper>
            </div>
          )}

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormWrapper id="mrr" label="MRR ($)">
              <Input
                id="mrr"
                type="number"
                value={formData.mrr}
                onChange={(e) => handleInputChange('mrr', e.target.value)}
                placeholder="5000"
                min="0"
              />
            </FormWrapper>

            <FormWrapper id="health_score" label="Health Score (0-100)">
              <Input
                id="health_score"
                type="number"
                value={formData.health_score}
                onChange={(e) => handleInputChange('health_score', e.target.value)}
                placeholder="85"
                min="0"
                max="100"
              />
            </FormWrapper>

            <FormWrapper id="nps_score" label="NPS Score (-100 to 100)">
              <Input
                id="nps_score"
                type="number"
                value={formData.nps_score}
                onChange={(e) => handleInputChange('nps_score', e.target.value)}
                placeholder="50"
                min="-100"
                max="100"
              />
            </FormWrapper>
          </div>

          {/* Contract Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormWrapper id="start_date" label="Contract Start Date" required>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </FormWrapper>

            <FormWrapper id="contract_type" label="Contract Type">
              <Select
                value={formData.contract_type}
                onValueChange={(value) => handleInputChange('contract_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Front End">Front End</SelectItem>
                  <SelectItem value="GCC">GCC</SelectItem>
                  <SelectItem value="Olympia">Olympia</SelectItem>
                  <SelectItem value="Recovery">Recovery</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormWrapper>

            <FormWrapper id="contract_duration_months" label="Duration (Months)" required>
              <Select
                value={formData.contract_duration_months}
                onValueChange={(value) => handleInputChange('contract_duration_months', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="18">18 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </FormWrapper>
          </div>

          {/* Calculated End Date Display */}
          {formData.start_date && formData.contract_duration_months && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Contract End Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(calculateEndDate(formData.start_date, formData.contract_duration_months)).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Days Remaining:</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const endDate = new Date(calculateEndDate(formData.start_date, formData.contract_duration_months));
                      const today = new Date();
                      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysLeft > 0 ? `${daysLeft} days` : 'Expired';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}