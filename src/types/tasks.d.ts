
export namespace Tasks {
  type Priority = 'high' | 'medium' | 'low';
  type Status = 'pending' | 'in_progress' | 'completed';

  interface Task {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    status: Status;
    due_date?: string;
    assigned_to: string;
    assigned_by: string;
    completion_date?: string;
    created_at: string;
    updated_at: string;
  }

  interface Communication {
    id: string;
    type: 'email' | 'call' | 'meeting' | 'note';
    subject: string;
    content: string;
    client_id: string;
    sent_by: string;
    date: string;
    created_at: string;
  }
}
