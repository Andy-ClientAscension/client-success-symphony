
import React, { useState } from 'react';
import { useCommunications } from '@/hooks/use-communications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tasks } from '@/types/tasks';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

export function CommunicationCenter() {
  const { communications, createCommunication } = useCommunications();
  const { user } = useAuth();
  const [newCommunication, setNewCommunication] = useState<Partial<Tasks.Communication>>({
    type: 'note',
    subject: '',
    content: '',
    client_id: ''
  });

  const handleCreateCommunication = async () => {
    if (!newCommunication.subject || !user) return;

    await createCommunication({
      type: newCommunication.type as Tasks.Communication['type'] || 'note',
      subject: newCommunication.subject,
      content: newCommunication.content || '',
      client_id: newCommunication.client_id || '',
      sent_by: user.id, // Add the missing sent_by field
      date: new Date().toISOString()
    });

    // Reset form
    setNewCommunication({
      type: 'note',
      subject: '',
      content: '',
      client_id: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Center</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newCommunication.type as string}
              onValueChange={(value) => setNewCommunication(prev => ({ ...prev, type: value as Tasks.Communication['type'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Communication Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Client ID"
              value={newCommunication.client_id}
              onChange={(e) => setNewCommunication(prev => ({ ...prev, client_id: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Subject"
            value={newCommunication.subject}
            onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
          />
          <Textarea
            placeholder="Communication Content"
            value={newCommunication.content}
            onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
          />
          <Button onClick={handleCreateCommunication}>Log Communication</Button>

          <div className="space-y-2">
            <h3 className="font-semibold">Recent Communications</h3>
            {communications.map(comm => (
              <div 
                key={comm.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{comm.subject}</div>
                  <div className="text-sm text-muted-foreground">
                    {comm.type} - {format(new Date(comm.date), 'PPP')}
                  </div>
                  <div className="text-xs">{comm.content}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Client: {comm.client_id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
