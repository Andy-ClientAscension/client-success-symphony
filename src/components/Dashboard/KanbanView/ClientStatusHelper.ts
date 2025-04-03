
// Define a type for the status groups
export type StatusGroup = 'new' | 'active' | 'backend' | 'olympia' | 'at-risk' | 'churned';

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new': return 'New';
    case 'active': return 'Active';
    case 'backend': return 'Backend';
    case 'olympia': return 'Olympia';
    case 'at-risk': return 'At Risk';
    case 'churned': return 'Churned';
    default: return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new': return 'bg-brand-100 text-brand-800';
    case 'active': return 'bg-success-100 text-success-800';
    case 'backend': return 'bg-purple-100 text-purple-800';
    case 'olympia': return 'bg-indigo-100 text-indigo-800';
    case 'at-risk': return 'bg-warning-100 text-warning-800';
    case 'churned': return 'bg-danger-100 text-danger-800';
    default: return 'bg-muted text-muted-foreground';
  }
};
