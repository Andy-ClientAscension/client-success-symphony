import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, X, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormWrapper } from '@/components/ui/form-wrapper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractNotification {
  id: string;
  client_id: string;
  days_remaining: number;
  notification_type: string;
  assigned_ssc: string;
  team: string;
  client_name: string;
  contract_end_date: string;
  sent_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

interface NotificationActionForm {
  action_type: 'unreachable' | 'backend_offer' | 'reminder';
  backend_months?: string;
  reminder_hours?: string;
  notes: string;
}

export function ContractNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ContractNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<ContractNotification | null>(null);
  const [actionForm, setActionForm] = useState<NotificationActionForm>({
    action_type: 'reminder',
    notes: ''
  });

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_notifications')
        .select('*')
        .eq('acknowledged', false)
        .order('days_remaining', { ascending: true });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contract notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('contract-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'contract_notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getPriorityColor = (daysRemaining: number) => {
    if (daysRemaining <= 0) return 'destructive';
    if (daysRemaining <= 3) return 'destructive';
    if (daysRemaining <= 7) return 'secondary';
    if (daysRemaining <= 14) return 'secondary';
    return 'default';
  };

  const getPriorityIcon = (daysRemaining: number) => {
    if (daysRemaining <= 0) return <AlertTriangle className="h-4 w-4" />;
    if (daysRemaining <= 7) return <Clock className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      '80_days': '80 Days Notice',
      '45_days': '45 Days Notice',
      '30_days': '30 Days Notice',
      '2_weeks': '2 Weeks Notice',
      '1_week': '1 Week Notice',
      '5_days': '5 Days Notice',
      '3_days': '3 Days Notice',
      '2_days': '2 Days Notice',
      '24_hours': '24 Hours Notice',
      'contract_ended': 'Contract Ended'
    };
    return labels[type] || type;
  };

  const handleNotificationAction = async () => {
    if (!selectedNotification) return;

    try {
      // Acknowledge the notification
      const { error: updateError } = await supabase
        .from('contract_notifications')
        .update({ 
          acknowledged: true, 
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'current_user' // In a real app, this would be the actual user
        })
        .eq('id', selectedNotification.id);

      if (updateError) throw updateError;

      // Here you would typically:
      // 1. Update client record based on action
      // 2. Set reminders in notification system
      // 3. Log the action taken

      toast({
        title: "Action Recorded",
        description: `Action taken for ${selectedNotification.client_name}: ${actionForm.action_type}`,
      });

      setSelectedNotification(null);
      setActionForm({ action_type: 'reminder', notes: '' });
      fetchNotifications();

    } catch (error) {
      console.error('Error processing notification action:', error);
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Contract Expiry Notifications
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No pending contract notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(notification.days_remaining)}
                    <div>
                      <div className="font-medium">{notification.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        SSC: {notification.assigned_ssc} • Team: {notification.team}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contract ends: {new Date(notification.contract_end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityColor(notification.days_remaining)}>
                      {notification.days_remaining === 0 
                        ? 'Expired' 
                        : `${notification.days_remaining} days left`}
                    </Badge>
                    <Badge variant="outline">
                      {getNotificationTypeLabel(notification.notification_type)}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog 
        open={!!selectedNotification} 
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Take Action - {selectedNotification?.client_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Client:</strong> {selectedNotification?.client_name}</div>
                <div><strong>SSC:</strong> {selectedNotification?.assigned_ssc}</div>
                <div><strong>Days Remaining:</strong> {selectedNotification?.days_remaining}</div>
                <div><strong>Contract End:</strong> {selectedNotification?.contract_end_date && new Date(selectedNotification.contract_end_date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Action Selection */}
            <FormWrapper id="action_type" label="Action Type" required>
              <Select
                value={actionForm.action_type}
                onValueChange={(value: 'unreachable' | 'backend_offer' | 'reminder') => 
                  setActionForm(prev => ({ ...prev, action_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unreachable">Cannot Reach Client</SelectItem>
                  <SelectItem value="backend_offer">Client Accepted Backend Offer</SelectItem>
                  <SelectItem value="reminder">Set Reminder</SelectItem>
                </SelectContent>
              </Select>
            </FormWrapper>

            {/* Conditional Fields */}
            {actionForm.action_type === 'backend_offer' && (
              <FormWrapper id="backend_months" label="Backend Offer Duration (Months)" required>
                <Select
                  value={actionForm.backend_months}
                  onValueChange={(value) => 
                    setActionForm(prev => ({ ...prev, backend_months: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {month} month{month > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormWrapper>
            )}

            {actionForm.action_type === 'reminder' && (
              <FormWrapper id="reminder_hours" label="Reminder In" required>
                <Select
                  value={actionForm.reminder_hours}
                  onValueChange={(value) => 
                    setActionForm(prev => ({ ...prev, reminder_hours: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="72">72 Hours (3 Days)</SelectItem>
                    <SelectItem value="168">1 Week</SelectItem>
                    <SelectItem value="336">2 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </FormWrapper>
            )}

            {/* Notes */}
            <FormWrapper id="notes" label="Notes">
              <Textarea
                id="notes"
                value={actionForm.notes}
                onChange={(e) => setActionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this client or action..."
                rows={3}
              />
            </FormWrapper>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedNotification(null)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleNotificationAction}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}